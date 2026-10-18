import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = {
  title: 'Surwi — Interactive Cube Portrait Portfolios',
  description: 'Two interactive 3D cube portrait portfolio experiences: corporate and creator.',
  viewport: 'width=device-width, initial-scale=1, viewport-fit=cover'
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
