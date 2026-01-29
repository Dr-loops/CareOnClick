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
                const parsedCredentials = loginSchema.safeParse(credentials);

                if (parsedCredentials.success) {
                    const { email, password } = parsedCredentials.data;
                    console.log("Server Login Attempt:", email);

                    const user = await prisma.user.findUnique({ where: { email } });
                    if (!user) {
                        console.log("User not found in DB:", email);
                        return null;
                    }

                    const passwordsMatch = await bcrypt.compare(password, user.password);
                    if (passwordsMatch) {
                        console.log("Password match! Login success for:", email);
                        return user;
                    } else {
                        console.log("Password mismatch for:", email);
                    }
                } else {
                    console.log("Invalid credentials schema");
                }
                return null;
            },
        }),
    ],
    session: { strategy: 'jwt' },
});
