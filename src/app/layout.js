// src/app/layout.js
'use client';
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "./components/layout/Header";
import { AppProvider } from "./components/layout/AppContext";
import { usePathname } from 'next/navigation';

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export default function RootLayout({ children }) {
  const pathname = usePathname();
  const isVideoCall = pathname?.startsWith('/video-call');

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <AppProvider>
          <Header />
          <main>
            {children}
          </main>
          {!isVideoCall && (
            <footer className="border-t p-8 text-center text-gray-500 mt-16 bg-gray-50">
              &copy; {new Date().getFullYear()} Tecnomédica. Todos los derechos reservados.
            </footer>
          )}
        </AppProvider>
      </body>
    </html>
  );
}
