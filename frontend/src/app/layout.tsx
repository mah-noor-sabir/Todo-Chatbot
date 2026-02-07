import type { Metadata } from 'next';
import './globals.css';
import ClientLayout from './ClientLayout';

export const metadata: Metadata = {
  title: 'Taskify — Organize your life with clarity',
  description:
    'Boost your productivity with our intuitive task management platform',
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-32x32.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen font-sans antialiased">
        {/* Theme-controlled background lives in globals.css */}
        <div className="min-h-screen flex flex-col">
          <ClientLayout>{children}</ClientLayout>
        </div>
      </body>
    </html>
  );
}
