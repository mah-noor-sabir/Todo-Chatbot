import type { Metadata } from 'next';
import './globals.css';
import ClientLayout from './ClientLayout';
import { ThemeProvider } from '../components/ThemeProvider';
import Footer from '../components/layout/Footer';

export const metadata: Metadata = {
  title: 'Taskify — Organize your life with clarity',
  description: 'Boost your productivity with our intuitive task management platform',
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
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-background font-sans text-foreground transition-colors duration-300">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          {/* Global background + layout wrapper */}
          <div className="min-h-screen flex flex-col">
            <ClientLayout>{children}</ClientLayout>
            <Footer />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
