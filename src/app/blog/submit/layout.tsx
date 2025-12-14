import type { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Submit Blog Post - Share Your Bitcoin Story | PanAfrican Bitcoin Academy',
  description: 'Submit your blog post to PanAfrican Bitcoin Academy. Share your Bitcoin journey, ideas, and experiences with the community.',
  alternates: {
    canonical: '/blog/submit',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function SubmitBlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

