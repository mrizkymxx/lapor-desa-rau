import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LAPOR DESA RAU ★",
  description: "Suara & Aspirasi Warga Desa Rau, Kedung, Jepara. Nyata & Langsung Sampai.",
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>📢</text></svg>",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#f6f5f0",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className="h-full">
      <body className="h-full bg-[#e8e6dc] flex justify-center text-[#121212] antialiased">
        {/* Mobile Viewport Container Neo-Brutalism */}
        <div className="w-full max-w-[430px] bg-[#f6f5f0] min-h-screen flex flex-col border-x-[3px] border-[#121212] shadow-[8px_0_0_#121212] relative">
          {children}
        </div>
      </body>
    </html>
  );
}
