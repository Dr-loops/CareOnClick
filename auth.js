import NextAuth from 'next-auth';
import { authConfig } from './auth.config';
import Credentials from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';
import { z } from 'zod';

const loginSchema = z.object({
    emailOrId: z.string().min(1), // Accept either email or ID
    password: z.string(),
});

export const { auth, signIn, signOut, handlers } = NextAuth({
    ...authConfig,
    providers: [
        Credentials({
            async authorize(credentials) {
                console.error("!!! AUTH TRIGGERED !!!");
                console.error("Credentials received:", JSON.stringify(credentials));
                try {
                    const parsedCredentials = loginSchema.safeParse(credentials);

                    if (parsedCredentials.success) {
                        const { emailOrId, password } = parsedCredentials.data;
                        const trimmedInput = emailOrId.trim();
                        const lowerInput = trimmedInput.toLowerCase();

                        console.log(`[AUTH] Attempting login for: "${emailOrId}"`);

                        // Try finding user by Email (case insensitive) OR ID/Path (original)
                        const user = await prisma.user.findFirst({
                            where: {
                                OR: [
                                    { email: lowerInput },
                                    { email: trimmedInput },
                                    { id: trimmedInput },
                                    { pathNumber: trimmedInput }
                                ]
                            }
                        });

                        if (!user) {
                            console.log(`[AUTH] ❌ FAIL: User NOT FOUND for: "${emailOrId}" in DB: ${process.env.DATABASE_URL.substring(0, 30)}...`);
                            return null;
                        }

                        console.log(`[AUTH] 🔍 OK: User FOUND - ${user.email} (ID: ${user.id})`);

                        const passwordsMatch = await bcrypt.compare(password, user.password);
                        if (passwordsMatch) {
                            const isAllowed = user.verificationStatus === 'Verified' || user.verificationStatus === 'Approved';
                            if (!isAllowed) {
                                console.log(`[AUTH] ⚠️ BLOCK: User ${user.email} is ${user.verificationStatus} (not Verified/Approved)`);
                                throw new Error('Account pending verification');
                            }
                            console.log(`[AUTH] ✅ SUCCESS: Password MATCH for: ${user.email}`);
                            return user;
                        } else {
                            console.log(`[AUTH] ❌ FAIL: Password MISMATCH for: ${user.email}`);
                            console.log(`[AUTH] Debug: Input password length: ${password.length}, DB password hash starts with: ${user.password.substring(0, 10)}`);
                        }
                    } else {
                        console.log("[AUTH] ❌ FAIL: Invalid input format:", parsedCredentials.error.format());
                    }
                } catch (e) {
                    console.error("[AUTH] ‼️ FATAL ERROR in authorize:", e);
                }
                return null;
            },
        }),
    ],
    session: { strategy: 'jwt' },
    secret: process.env.AUTH_SECRET || "DrKalsSuperSecretKey2026_FALLBACK",
    trustHost: true,
    debug: true,
});
