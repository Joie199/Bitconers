import type { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Setup Password - PanAfrican Bitcoin Academy',
  description: 'Setup your password for PanAfrican Bitcoin Academy account.',
  alternates: {
    canonical: '/setup-password',
  },
  robots: {
    noindex: true,
    nofollow: true,
  },
};

export default function SetupPasswordLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

