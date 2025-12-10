import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const { firstName, lastName, email, password } = await req.json();

    if (!firstName || !lastName || !email) {
      return NextResponse.json(
        { error: 'firstName, lastName, and email are required' },
        { status: 400 }
      );
    }

    // Check if profile already exists
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', email.toLowerCase().trim())
      .maybeSingle();

    if (existingProfile) {
      // Profile already exists - return success
      return NextResponse.json(
        { success: true, profileId: existingProfile.id, message: 'Profile already exists' },
        { status: 200 }
      );
    }

    // Hash password (simple hash - in production use bcrypt or Supabase Auth)
    // For now, we'll just store it (NOT RECOMMENDED FOR PRODUCTION)
    // TODO: Use Supabase Auth for proper password hashing
    const passwordHash = password ? `hashed_${password}` : null;

    // Create profile - simplified, no student_id
    const { data: newProfile, error: profileError } = await supabase
      .from('profiles')
      .insert({
        name: `${firstName} ${lastName}`.trim(),
        email: email.toLowerCase().trim(),
        password_hash: passwordHash,
        status: 'New',
      })
      .select()
      .single();

    if (profileError) {
      console.error('Error creating profile:', profileError);
      return NextResponse.json(
        { error: 'Failed to create profile', details: profileError.message },
        { status: 500 }
      );
    }

    const profile = newProfile;

    // Don't create student record automatically
    // Student record will be created when user applies and gets accepted
    // This allows users to sign up without being students yet

    // Return success - profile was created successfully
    return NextResponse.json(
      { success: true, profileId: profile.id },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error in profile register API:', error);
    return NextResponse.json(
      { error: 'Failed to create profile', details: error.message },
      { status: 500 }
    );
  }
}

