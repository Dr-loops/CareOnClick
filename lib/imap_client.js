import imap from 'imap-simple';
import { simpleParser } from 'mailparser';

// function fetchEmails(limit = 20) { ... } removed as unused

// Let's rewrite the export to be cleaner and efficient
export const getLatestEmails = async (limit = 20) => {
    const config = {
        imap: {
            user: process.env.EMAIL_USER,
            password: process.env.EMAIL_PASS,
            host: 'imap.gmail.com',
            port: 993,
            tls: true,
            authTimeout: 10000
        }
    };

    try {
        const connection = await imap.connect(config);
        await connection.openBox('INBOX');

        // Fetch headers only first
        const searchCriteria = ['ALL'];
        const fetchOptions = {
            bodies: ['HEADER'], // minimal
            struct: true
        };

        const allMessages = await connection.search(searchCriteria, fetchOptions);
        // Sort by ID or Date
        const sorted = allMessages.sort((a, b) => b.attributes.uid - a.attributes.uid).slice(0, limit);

        const results = await Promise.all(sorted.map(async (msg) => {
            const headerPart = msg.parts.find(part => part.which === 'HEADER');
            const subject = headerPart.body.subject?.[0] || '(No Subject)';
            const from = headerPart.body.from?.[0] || '(Unknown)';
            const date = headerPart.body.date?.[0] || new Date().toISOString();

            return {
                id: msg.attributes.uid,
                subject,
                from,
                date,
                snippet: "Loading..." // Body requires more bandwidth
            };
        }));

        connection.end();
        return results;
    } catch (error) {
        console.error(error);
        return []; // Fail gracefully
    }
};

export const getInbox = async (limit = 15) => {
    const config = {
        imap: {
            user: process.env.EMAIL_USER,
            password: process.env.EMAIL_PASS,
            host: 'imap.gmail.com',
            port: 993,
            tls: true,
            tlsOptions: { rejectUnauthorized: false },
            authTimeout: 15000
        }
    };

    try {
        const connection = await imap.connect(config);
        await connection.openBox('INBOX');

        const searchCriteria = ['ALL'];
        const fetchOptions = {
            bodies: ['HEADER.FIELDS (DATE SUBJECT FROM)'],
            struct: false
        };

        const allMessages = await connection.search(searchCriteria, fetchOptions);

        const sorted = allMessages.sort((a, b) => {
            return b.attributes.uid - a.attributes.uid;
        }).slice(0, limit);

        if (sorted.length === 0) {
            connection.end();
            return [];
        }

        const uidsToFetch = sorted.map(m => m.attributes.uid);
        const bodyFetchCriteria = [['UID', ...uidsToFetch]];

        const fullMessages = await connection.search(bodyFetchCriteria, { bodies: [''], markSeen: false });

        const parsed = await Promise.all(fullMessages.map(async (item) => {
            try {
                const allPart = item.parts.find(p => p.which === '');
                const rawSource = allPart ? allPart.body : '';
                const parsedMail = await simpleParser(rawSource);

                return {
                    id: item.attributes.uid,
                    seq: item.seqNo,
                    from: parsedMail.from?.text || 'Unknown',
                    fromAddress: parsedMail.from?.value?.[0]?.address || '',
                    subject: parsedMail.subject || '(No Subject)',
                    date: parsedMail.date || new Date(),
                    body: parsedMail.text || '',
                    html: parsedMail.html || parsedMail.textAsHtml || parsedMail.text
                };
            } catch {
                return { id: item.attributes.uid, subject: 'Error parsing', body: '' };
            }
        }));

        parsed.sort((a, b) => b.id - a.id);

        connection.end();
        return parsed;
    } catch (e) {
        console.error("Inbox Fetch Error:", e);
        return [];
    }
};

export const deleteEmail = async (uid) => {
    const config = {
        imap: {
            user: process.env.EMAIL_USER,
            password: process.env.EMAIL_PASS,
            host: 'imap.gmail.com',
            port: 993,
            tls: true,
            tlsOptions: { rejectUnauthorized: false },
            authTimeout: 10000
        }
    };
    try {
        const connection = await imap.connect(config);
        await connection.openBox('INBOX');

        await connection.moveMessage(uid, '[Gmail]/Trash');

        connection.end();
        return { success: true };
    } catch (e) {
        console.error("Delete Error:", e);
        return { success: false, error: e.message };
    }
};
