import { Montserrat, Open_Sans } from 'next/font/google';
import './globals.css';
import Navbar from '../components/Navbar';
import { AuthProvider } from '@/components/AuthProvider';
import ErrorBoundary from '@/components/ErrorBoundary';

const montserrat = Montserrat({
    subsets: ['latin'],
    variable: '--font-montserrat',
    display: 'swap',
});

const openSans = Open_Sans({
    subsets: ['latin'],
    variable: '--font-open-sans',
    display: 'swap',
});

export const metadata = {
    title: {
        default: "Dr Kal's Virtual Hospital",
        template: "%s | Dr Kal's Virtual Hospital"
    },
    description: 'A premium, secure healthcare platform providing virtual consultations, medical records, and real-time patient care.',
    keywords: ['virtual hospital', 'telehealth', 'healthcare platform', 'online doctor', 'medical records'],
    authors: [{ name: 'Dr Kal Team' }],
    viewport: 'width=device-width, initial-scale=1',
    icons: {
        icon: '/logo.png',
    },
};

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <body className={`${openSans.variable} ${montserrat.variable}`} suppressHydrationWarning={true}>
                <AuthProvider>
                    <Navbar />
                    <main className="main-content">
                        <ErrorBoundary>
                            {children}
                        </ErrorBoundary>
                    </main>
                </AuthProvider>
            </body>
        </html>
    );
}
