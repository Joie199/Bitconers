import type { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Reset Password - PanAfrican Bitcoin Academy',
  description: 'Reset your password for PanAfrican Bitcoin Academy account.',
  alternates: {
    canonical: '/reset-password',
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function ResetPasswordLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

