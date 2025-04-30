import type {Metadata} from 'next';
import { GeistSans } from 'geist/font/sans'; // Use Geist Sans from the geist package
import './globals.css';
import { Toaster } from "@/components/ui/toaster"; // Import Toaster

// Removed Geist Mono as it's not specified in the design. Using Geist Sans for consistency.

export const metadata: Metadata = {
  title: 'Exam Eligibility Tracker', // Updated title
  description: 'Track student attendance and exam eligibility.', // Updated description
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${GeistSans.variable} font-sans antialiased`}> {/* Using font-sans tailwind class */}
        {children}
        <Toaster /> {/* Add Toaster here */}
      </body>
    </html>
  );
}
