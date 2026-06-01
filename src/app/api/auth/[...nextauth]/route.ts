import NextAuth, { AuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import { MOCK_PROFILES } from '@/data/mockProfiles';

export const authOptions: AuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    }),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
        profileId: { label: 'Profile ID', type: 'text' },
      },
      async authorize(credentials) {
        if (!credentials?.email && !credentials?.profileId) return null;

        // If a specific profile ID is selected from the fake UI, use it
        if (credentials.profileId) {
          const profile = MOCK_PROFILES.find((p) => p.id === credentials.profileId);
          if (profile) {
            return {
              id: profile.id,
              name: profile.name,
              email: 'mock@dhobiflix.in',
              image: '', // Can be substituted with emoji or left empty
              profileId: profile.id,
              avatarEmoji: profile.avatarEmoji,
            };
          }
        }

        // Fallback: accept any email/password and assign Veeraa's profile
        return {
          id: MOCK_PROFILES[0].id,
          name: MOCK_PROFILES[0].name,
          email: credentials.email || 'veeraa@dhobiflix.in',
          image: '',
          profileId: MOCK_PROFILES[0].id,
          avatarEmoji: MOCK_PROFILES[0].avatarEmoji,
        };
      },
    }),
  ],
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).profileId = token.profileId;
        (session.user as any).avatarEmoji = token.avatarEmoji;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.profileId = (user as any).profileId;
        token.avatarEmoji = (user as any).avatarEmoji;
      }
      return token;
    },
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
