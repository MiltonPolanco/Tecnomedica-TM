// /src/app/api/auth/[...nextauth]/route.js
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import * as mongoose from "mongoose";
import bcrypt from "bcrypt";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import client from "../../../../libs/mongoConnect";
import { User } from "@/models/User";

const authOptions = {
  secret: process.env.SECRET,
  adapter: MongoDBAdapter(client),

  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    CredentialsProvider({
      name: "Credentials",
      id: "credentials",
      credentials: {
        email:    { label: "Email",    type: "email",    placeholder: "you@example.com" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (mongoose.connection.readyState === 0) {
          await mongoose.connect(process.env.MONGO_URL);
        }
        const user = await User.findOne({ email: credentials.email });
        if (!user) return null;
        const valid = bcrypt.compareSync(credentials.password, user.password);
        if (!valid) return null;
        return {
          id:    user._id.toString(),
          email: user.email,
          role:  user.role
        };
      }
    })
  ],

  callbacks: {
    // Guardamos id y role en el JWT
    async jwt({ token, user }) {
      if (user) {
        token.id   = user.id;
        token.role = user.role;
      }
      return token;
    },
    // Inyectamos id y role en session.user
    async session({ session, token }) {
      session.user.id   = token.id;
      session.user.role = token.role;
      return session;
    }
  },

  session: {
    strategy: "jwt"
  },
  pages: {
    signIn: "/login",
  }
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
