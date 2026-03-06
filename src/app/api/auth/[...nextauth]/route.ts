import NextAuth from "next-auth";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import clientPromise from "@/lib/mongodb";
import { NextAuthOptions } from "next-auth";

export const authOptions: NextAuthOptions = {
  adapter: MongoDBAdapter(clientPromise),
  providers: [
    // We'll use a simple Credentials provider for this private app,
    // or you can add Google/GitHub if needed.
    // For now, let's assume a simple setup or mock for private use.
    {
      id: "credentials",
      name: "Credentials",
      type: "credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        // Simple mock for a private user
        if (credentials?.username === "admin" && credentials?.password === "admin") {
          return { id: "65e6d6b8b8b8b8b8b8b8b8b8", name: "Admin", email: "admin@example.com" };
        }
        return null;
      }
    }
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async session({ session, token }) {
      if (token && session.user) {
        (session.user as any).id = token.sub;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET || "secret",
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
