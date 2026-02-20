import NextAuth, { DefaultSession } from 'next-auth';
import Google from 'next-auth/providers/google';

// 세션 타입 확장 — user.id 필드 추가
declare module 'next-auth' {
  interface Session {
    user: {
      id: string;  // Google 계정 고유 ID
    } & DefaultSession['user'];
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [Google],

  callbacks: {
    // JWT 생성 시: Google 계정 ID를 토큰에 저장
    async jwt({ token, account }) {
      if (account?.providerAccountId) {
        token['userId'] = account.providerAccountId;
      }
      return token;
    },

    // 세션 생성 시: JWT의 userId를 session.user.id로 노출
    async session({ session, token }) {
      const userId = token['userId'] as string | undefined;
      if (userId) {
        session.user.id = userId;
      }
      return session;
    },
  },
});
