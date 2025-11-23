// src/app/layout.js
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "./components/layout/Header";
import { AppProvider } from "./components/layout/AppContext";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <AppProvider>
          <Header />
          <main>
            {children}
          </main>
          <footer className="border-t p-8 text-center text-gray-500 mt-16 bg-gray-50">
            &copy; {new Date().getFullYear()} Tecnomédica. Todos los derechos reservados.
          </footer>
        </AppProvider>
      </body>
    </html>
  );
}
