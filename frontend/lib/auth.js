import GoogleProvider from "next-auth/providers/google";
import { inferUserRole } from "./roles";

const googleFactory =
  typeof GoogleProvider === "function" ? GoogleProvider : GoogleProvider.default;

async function refreshGoogleAccessToken(token) {
  try {
    if (!token?.refreshToken) return { ...token, error: "MissingRefreshToken" };

    const response = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID || "",
        client_secret: process.env.GOOGLE_CLIENT_SECRET || "",
        grant_type: "refresh_token",
        refresh_token: token.refreshToken,
      }),
    });
    const refreshed = await response.json();

    if (!response.ok) {
      return { ...token, error: `RefreshAccessTokenError: ${refreshed?.error || "unknown"}` };
    }

    return {
      ...token,
      accessToken: refreshed.access_token,
      accessTokenExpires: Date.now() + refreshed.expires_in * 1000,
      refreshToken: refreshed.refresh_token || token.refreshToken,
      error: undefined,
    };
  } catch {
    return { ...token, error: "RefreshAccessTokenError" };
  }
}

export const authOptions = {
  providers: [
    googleFactory({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          scope:
            "openid email profile https://www.googleapis.com/auth/calendar.events",
          access_type: "offline",
          prompt: "consent",
          response_type: "code",
        },
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/signin",
    error: "/signin",
  },
  callbacks: {
    async jwt({ token, account, user, profile }) {
      const email = user?.email || profile?.email || token?.email;
      token.userRole = inferUserRole(email);

      if (account?.access_token) {
        token.accessToken = account.access_token;
        token.accessTokenExpires = account.expires_at
          ? account.expires_at * 1000
          : Date.now() + 55 * 60 * 1000;
      }
      if (account?.refresh_token) {
        token.refreshToken = account.refresh_token;
      }

      if (token.accessToken && token.accessTokenExpires) {
        if (Date.now() < token.accessTokenExpires - 60 * 1000) return token;
      }

      if (token.refreshToken) return refreshGoogleAccessToken(token);
      return token;
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken;
      session.userRole = token.userRole || inferUserRole(session?.user?.email);
      session.authError = token.error;
      return session;
    },
    async signIn({ user, profile }) {
      const email = String(user?.email || profile?.email || "").toLowerCase();
      const isVerified =
        typeof profile?.email_verified === "boolean" ? profile.email_verified : true;
      const role = inferUserRole(email);
      return isVerified && role !== "blocked";
    },
  },
};
