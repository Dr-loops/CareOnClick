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
                try {
                    const parsedCredentials = loginSchema.safeParse(credentials);

                    if (parsedCredentials.success) {
                        const { emailOrId, password } = parsedCredentials.data;
                        const trimmedInput = emailOrId.trim();
                        const lowerInput = trimmedInput.toLowerCase();

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
                            console.log(`[AUTH] ❌ User NOT FOUND for: "${emailOrId}"`);
                            return null;
                        }

                        console.log(`[AUTH] 🔍 User FOUND: ${user.email} (Role: ${user.role}, ID: ${user.id})`);

                        const passwordsMatch = await bcrypt.compare(password, user.password);
                        if (passwordsMatch) {
                            console.log(`[AUTH] ✅ Password MATCH for: ${user.email}`);
                            return user;
                        } else {
                            console.log(`[AUTH] ❌ Password MISMATCH for: ${user.email}`);
                        }
                    } else {
                        console.log("[AUTH] Invalid input format:", parsedCredentials.error.format());
                    }
                } catch (e) {
                    console.error("[AUTH] Fatal Error:", e);
                }
                return null;
            },
        }),
    ],
    session: { strategy: 'jwt' },
    secret: process.env.AUTH_SECRET || "DrKalsSuperSecretKey2026_FALLBACK",
    trustHost: true,
});
