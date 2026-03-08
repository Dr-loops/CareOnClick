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
    basePath: '/api/auth',
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

                        console.log(`[AUTH] Attempting login for: "${emailOrId}" (Length: ${emailOrId.length})`);
                        console.log(`[AUTH] DEBUG: ENV DATABASE_URL starts with: ${process.env.DATABASE_URL ? process.env.DATABASE_URL.substring(0, 30) : 'MISSING'}...`);
                        console.log(`[AUTH] DEBUG: ENV AUTH_SECRET is ${process.env.AUTH_SECRET ? 'PRESENT' : 'MISSING'}`);

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
                            console.log(`[AUTH] ❌ FAIL: User NOT FOUND for: "${emailOrId}"`);
                            // Debug list existing emails (safely)
                            const count = await prisma.user.count();
                            console.log(`[AUTH] DEBUG: Current user count in DB: ${count}`);
                            return null;
                        }

                        console.log(`[AUTH] 🔍 OK: User FOUND - ${user.email} (ID: ${user.id}, Role: ${user.role}, Status: ${user.verificationStatus})`);

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
                    throw e; // Bubble up for NextAuth to handle
                }
                return null;
            },
        }),
    ],
    session: { strategy: 'jwt' },
    events: {
        async signIn({ user }) {
            const { logAction } = await import('@/lib/logger');
            await logAction({
                action: 'LOGIN',
                actorId: user.id,
                actorName: user.name || user.email,
                details: `User logged in successfully from ${user.role} portal.`
            });
        },
        async signOut({ token }) {
            const { logAction } = await import('@/lib/logger');
            await logAction({
                action: 'LOGOUT',
                actorId: token.sub,
                actorName: token.email || token.name || 'User',
                details: 'User logged out.'
            });
        },
    },
    secret: process.env.AUTH_SECRET || "DrKalsSuperSecretKey2026_FALLBACK",
    trustHost: true,
    debug: true,
});
