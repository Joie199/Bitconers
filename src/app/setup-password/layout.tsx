import type { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Setup Password - PanAfrican Bitcoin Academy',
  description: 'Setup your password for PanAfrican Bitcoin Academy account.',
  alternates: {
    canonical: '/setup-password',
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function SetupPasswordLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

