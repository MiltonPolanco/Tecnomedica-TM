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
  secret: process.env.NEXTAUTH_SECRET,
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
        email:    { label: "Email",    type: "email",    placeholder: "correo@ejemplo.com" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        const dbConnect = (await import('@/libs/dbConnect')).default;
        await dbConnect();
        
        if (mongoose.connection.readyState === 0) {
          await mongoose.connect(process.env.MONGO_URL);
        }
        const user = await User.findOne({ email: credentials.email }).select('+password');
        if (!user) return null;
        
        const valid = await user.comparePassword(credentials.password);
        if (!valid) return null;
        
        return {
          id:    user._id.toString(),
          name:  user.name || '',
          email: user.email,
          role:  user.role,
          phone: user.phone || '',
          bloodType: user.bloodType || '',
          createdAt: user.createdAt,
          image: user.image
        };
      }
    })
  ],

  callbacks: {
    // Guardamos datos del usuario en el JWT
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id   = user.id;
        token.name = user.name;
        token.role = user.role;
        token.phone = user.phone;
        token.bloodType = user.bloodType;
        token.createdAt = user.createdAt;
      }
      
      // Cuando se llama update() desde el cliente, actualizamos el token
      if (trigger === "update" && session) {
        token.name = session.user.name || token.name;
        token.phone = session.user.phone || token.phone;
        token.bloodType = session.user.bloodType || token.bloodType;
      }
      
      return token;
    },
    // Inyectamos datos en session.user
    async session({ session, token }) {
      if (session?.user) {
        session.user.id   = token.id;
        session.user.name = token.name;
        session.user.role = token.role;
        session.user.phone = token.phone;
        session.user.bloodType = token.bloodType;
        session.user.createdAt = token.createdAt;
      }
      return session;
    }
  },

  session: {
    strategy: "jwt"
  },
  pages: {
    signIn: "/login",
  },
  logger: {
    error: () => {},
    warn: () => {},
    debug: () => {},
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST, authOptions };
