import type { Metadata } from 'next';
import './globals.css';
import ClientLayout from './ClientLayout';
import { ThemeProvider } from '../components/ThemeProvider';
import Footer from '../components/layout/Footer';

export const metadata: Metadata = {
  title: 'Taskify-dashboard',
  description: 'Phase II – Full-Stack Web Application',
  icons: {
    icon: '/favicon.ico',
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
