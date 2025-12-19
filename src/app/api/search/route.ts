import { NextRequest, NextResponse } from 'next/server';
import { chaptersContent } from '@/content/chaptersContent';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q')?.toLowerCase().trim() || '';

    if (!query || query.length < 2) {
      return NextResponse.json({ results: [] });
    }

    const results: any[] = [];

    // Search chapters
    chaptersContent.forEach((chapter) => {
      const searchText = [
        chapter.title,
        chapter.hook,
        ...chapter.learn,
        ...chapter.summary,
        ...chapter.keyTerms,
        ...chapter.sections.flatMap(section => [
          section.heading,
          ...(section.paragraphs || []),
          ...(section.bullets || []),
          ...(section.callouts?.map(c => c.content) || [])
        ])
      ].join(' ').toLowerCase();

      if (searchText.includes(query)) {
        // Find matching sections
        const matchingSections = chapter.sections.filter(section => {
          const sectionText = [
            section.heading,
            ...(section.paragraphs || []),
            ...(section.bullets || [])
          ].join(' ').toLowerCase();
          return sectionText.includes(query);
        });

        if (matchingSections.length > 0) {
          matchingSections.forEach(section => {
            const excerpt = section.paragraphs?.[0]?.substring(0, 150) || section.heading;
            results.push({
              type: 'Chapter',
              icon: '📚',
              title: `${chapter.number}. ${chapter.title} - ${section.heading}`,
              excerpt: excerpt.length > 150 ? excerpt + '...' : excerpt,
              url: `/chapters/${chapter.slug}`,
              chapterNumber: chapter.number,
            });
          });
        } else {
          // General chapter match
          results.push({
            type: 'Chapter',
            icon: '📚',
            title: `Chapter ${chapter.number}: ${chapter.title}`,
            excerpt: chapter.hook.substring(0, 150),
            url: `/chapters/${chapter.slug}`,
            chapterNumber: chapter.number,
          });
        }
      }
    });

    // Search blog posts (if API exists)
    try {
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 
        (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');
      
      const blogResponse = await fetch(`${baseUrl}/api/blog?search=${encodeURIComponent(query)}`, {
        cache: 'no-store',
      });

      if (blogResponse.ok) {
        const blogData = await blogResponse.json();
        if (blogData.posts && Array.isArray(blogData.posts)) {
          blogData.posts.forEach((post: any) => {
            results.push({
              type: 'Blog',
              icon: '📝',
              title: post.title,
              excerpt: post.excerpt || post.content?.substring(0, 150) || '',
              url: `/blog/${post.slug || post.id}`,
            });
          });
        }
      }
    } catch (error) {
      // Blog search is optional, continue without it
      console.log('Blog search unavailable:', error);
    }

    // Sort results: chapters first, then blog posts
    results.sort((a, b) => {
      if (a.type === 'Chapter' && b.type === 'Blog') return -1;
      if (a.type === 'Blog' && b.type === 'Chapter') return 1;
      return 0;
    });

    // Limit results
    return NextResponse.json({ results: results.slice(0, 10) });
  } catch (error: any) {
    console.error('Search error:', error);
    return NextResponse.json(
      { error: 'Search failed', results: [] },
      { status: 500 }
    );
  }
}
