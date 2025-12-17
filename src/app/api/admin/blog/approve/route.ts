import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

/**
 * POST /api/admin/blog/approve
 * Approve a blog submission and create a published blog post
 */
export async function POST(request: NextRequest) {
  try {
    // TODO: Add admin authentication check
    const body = await request.json();
    const { submissionId, slug, isFeatured, isBlogOfMonth } = body;

    if (!submissionId) {
      return NextResponse.json(
        { error: 'Submission ID is required' },
        { status: 400 }
      );
    }

    // Get the submission
    const { data: submission, error: subError } = await supabaseAdmin
      .from('blog_submissions')
      .select('*')
      .eq('id', submissionId)
      .maybeSingle();

    if (subError || !submission) {
      return NextResponse.json(
        { error: 'Submission not found' },
        { status: 404 }
      );
    }

    if (submission.status !== 'pending') {
      return NextResponse.json(
        { error: 'Submission has already been reviewed' },
        { status: 400 }
      );
    }

    // Generate slug if not provided
    let postSlug = slug;
    if (!postSlug) {
      const slugBase = submission.title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .trim();
      
      // Check if slug exists
      let slugCounter = 0;
      postSlug = slugBase;
      while (true) {
        const { data: existing } = await supabaseAdmin
          .from('blog_posts')
          .select('id')
          .eq('slug', postSlug)
          .maybeSingle();
        
        if (!existing) break;
        slugCounter++;
        postSlug = `${slugBase}-${slugCounter}`;
      }
    }

    // Calculate excerpt if needed
    const excerpt = submission.content.substring(0, 200).trim() + '...';

    // Check if author is a student
    let isAcademyStudent = false;
    if (submission.author_id) {
      const { data: student } = await supabaseAdmin
        .from('students')
        .select('profile_id')
        .eq('profile_id', submission.author_id)
        .maybeSingle();
      
      if (student) {
        isAcademyStudent = true;
      }
    }

    // Create blog post
    const { data: blogPost, error: postError } = await supabaseAdmin
      .from('blog_posts')
      .insert({
        title: submission.title,
        slug: postSlug,
        author_id: submission.author_id,
        author_name: submission.author_name,
        author_role: submission.cohort ? `Graduate, ${submission.cohort}` : null,
        author_country: null, // Can be added later
        author_bio: submission.author_bio,
        category: submission.category,
        excerpt: excerpt,
        content: submission.content,
        status: 'published',
        is_featured: isFeatured || false,
        is_blog_of_month: isBlogOfMonth || false,
        published_at: new Date().toISOString(),
      })
      .select('id, slug')
      .single();

    if (postError) {
      console.error('Error creating blog post:', postError);
      return NextResponse.json(
        {
          error: 'Failed to create blog post',
          ...(process.env.NODE_ENV === 'development' ? { details: postError.message } : {}),
        },
        { status: 500 }
      );
    }

    // Update submission status
    const { error: updateError } = await supabaseAdmin
      .from('blog_submissions')
      .update({
        status: 'approved',
        reviewed_at: new Date().toISOString(),
        // reviewed_by: adminId, // TODO: Add admin ID from auth
      })
      .eq('id', submissionId);

    if (updateError) {
      console.error('Error updating submission:', updateError);
      // Don't fail - post is created, just log the error
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Blog post approved and published',
        post: {
          id: blogPost.id,
          slug: blogPost.slug,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error in approve blog API:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        ...(process.env.NODE_ENV === 'development' ? { details: error.message } : {}),
      },
      { status: 500 }
    );
  }
}
