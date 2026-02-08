import type { Metadata } from 'next';
import './globals.css';
import ClientLayout from './ClientLayout';
import { ThemeProvider } from '../components/ThemeProvider';
import Footer from '../components/layout/Footer';

export const metadata: Metadata = {
<<<<<<< HEAD
  title: 'Taskify — Organize your life with clarity',
  description:
    'Boost your productivity with our intuitive task management platform',
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-32x32.png',
=======
  title: 'Taskify-dashboard',
  description: 'Phase II – Full-Stack Web Application',
  icons: {
    icon: '/favicon.ico',
>>>>>>> 5fe7471cbcc12e648f73a32c1344ed9f3fa1212c
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
<<<<<<< HEAD
    <html lang="en">
      <body className="min-h-screen font-sans antialiased">
        {/* Theme-controlled background lives in globals.css */}
        <div className="min-h-screen flex flex-col">
          <ClientLayout>{children}</ClientLayout>
        </div>
=======
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-background font-sans text-foreground transition-colors duration-300">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          {/* Global background + layout wrapper */}
          <div className="min-h-screen flex flex-col">
            <ClientLayout>{children}</ClientLayout>
            <Footer />
          </div>
        </ThemeProvider>
>>>>>>> 5fe7471cbcc12e648f73a32c1344ed9f3fa1212c
      </body>
    </html>
  );
}
