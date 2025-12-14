import type { NextAuthOptions, User as NextAuthUser } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { usersApi } from './api/users';

// Extend NextAuth User type
interface ExtendedUser extends NextAuthUser {
	role: 'teacher' | 'student';
}

export const authOptions: NextAuthOptions = {
	secret: process.env.NEXTAUTH_SECRET,
	providers: [
		CredentialsProvider({
			name: 'Credentials',
			credentials: {
				email: { label: 'Email', type: 'email' },
			},
			async authorize(credentials) {
				if (!credentials?.email) return null;

				const user = await usersApi.findByEmail(credentials.email);
				console.log('user', user);
				if (user) {
					return {
						id: user.id,
						email: user.email,
						name: user.name,
						role: user.role,
					} as ExtendedUser;
				}

				return null;
			},
		}),
	],
	callbacks: {
		async jwt({ token, user }) {
			if (user) {
				token.role = (user as ExtendedUser).role;
				token.id = user.id;
			}
			return token;
		},
		async session({ session, token }) {
			if (session.user) {
				(session.user as any).role = token.role;
				(session.user as any).id = token.id;
			}
			return session;
		},
	},
	pages: {
		signIn: '/login',
	},
	session: {
		strategy: 'jwt',
	},
	// trustHost: true,
};
