import NextAuth from 'next-auth';
import { authConfig } from './auth.config';
import Credentials from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';
import { z } from 'zod';

const loginSchema = z.object({
    email: z.string().email(),
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
                        const { email, password } = parsedCredentials.data;
                        const user = await prisma.user.findUnique({ where: { email } });
                        if (!user) return null;

                        const passwordsMatch = await bcrypt.compare(password, user.password);
                        if (passwordsMatch) return user;
                    }
                } catch (e) {
                    console.error("Auth Error:", e);
                }
                return null;
            },
        }),
    ],
    session: { strategy: 'jwt' },
    secret: process.env.AUTH_SECRET || "DrKalsSuperSecretKey2026_FALLBACK",
    trustHost: true,
});
