import type { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Reset Password - PanAfrican Bitcoin Academy',
  description: 'Reset your password for PanAfrican Bitcoin Academy account.',
  alternates: {
    canonical: '/reset-password',
  },
  robots: {
    noindex: true,
    nofollow: true,
  },
};

export default function ResetPasswordLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

