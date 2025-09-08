import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { prisma } from '@/lib/prisma';
import { supabase } from '@/lib/supabase';
import bcrypt from 'bcryptjs';

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        // Try Supabase first, fallback to Prisma for compatibility
        let user;
        try {
          const { data: supabaseUser, error } = await supabase
            .from('User')
            .select('*')
            .eq('email', credentials.email)
            .single();
          
          if (supabaseUser && !error) {
            user = supabaseUser;
          } else {
            // Fallback to Prisma
            user = await prisma.user.findUnique({
              where: {
                email: credentials.email
              }
            });
          }
        } catch (error) {
          // Fallback to Prisma if Supabase fails
          user = await prisma.user.findUnique({
            where: {
              email: credentials.email
            }
          });
        }

        if (!user) {
          return null;
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.passwordHash
        );

        if (!isPasswordValid) {
          return null;
        }

        return {
          id: user.id.toString(),
          email: user.email,
          name: user.name,
        };
      }
    })
  ],
  session: {
    strategy: 'jwt'
  },

  pages: {
    signIn: '/login'
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      // Redirigir al dashboard después del login exitoso
      if (url.startsWith(baseUrl)) {
        return url;
      }
      // Si es una URL relativa, permitirla
      if (url.startsWith('/')) {
        return `${baseUrl}${url}`;
      }
      // Por defecto, redirigir al dashboard
      return `${baseUrl}/dashboard`;
    }
  }
});

export { handler as GET, handler as POST };