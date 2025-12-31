import type { Metadata } from 'next';
import './tailwind.css';
import './globals.css';

export const metadata: Metadata = {
  title: 'Evolution of Todo',
  description: 'Phase II – Full-Stack Web Application',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head />
      <body className="min-h-screen font-sans text-gray-100">
        {/* Global background + layout wrapper */}
        <div
          className="
            min-h-screen flex flex-col
            bg-[radial-gradient(circle_at_top,rgba(168,136,255,0.12),transparent_55%),radial-gradient(circle_at_bottom,rgba(90,60,200,0.12),transparent_55%),linear-gradient(180deg,#05010a,#0b0614)]
          "
        >
          {children}
        </div>
      </body>
    </html>
  );
}
