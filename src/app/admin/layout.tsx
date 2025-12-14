import type { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Admin Dashboard - PanAfrican Bitcoin Academy',
  description: 'Admin dashboard for PanAfrican Bitcoin Academy.',
  alternates: {
    canonical: '/admin',
  },
  robots: {
    noindex: true,
    nofollow: true,
  },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

