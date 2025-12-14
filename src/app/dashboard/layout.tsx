import type { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Student Dashboard - PanAfrican Bitcoin Academy',
  description: 'Student dashboard for PanAfrican Bitcoin Academy.',
  alternates: {
    canonical: '/dashboard',
  },
  robots: {
    index: false,
    follow: false,
    noindex: true,
    nofollow: true,
  },
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

