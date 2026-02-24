import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { SessionProvider } from "@/contexts/SessionProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// ============================================
// METADATOS DE LA APLICACIÓN - FotoGestor
// ============================================
export const metadata: Metadata = {
  title: "FotoGestor - Sistema de Gestión de Clientes y Fotos",
  description: "Sistema integral para la gestión de clientes y registro de fotografías. Control de estados, importación masiva y más.",
  keywords: ["Fotografía", "Gestión", "Clientes", "Registro", "Sistema"],
  authors: [{ name: "FotoGestor Team" }],
  icons: {
    icon: "/logo.svg",
  },
};

// ============================================
// LAYOUT PRINCIPAL
// ============================================
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <SessionProvider>
          {children}
          <Toaster />
        </SessionProvider>
      </body>
    </html>
  );
}
