import { NextRequest, NextResponse } from 'next/server';

function cleanId(id: string) {
  return id.trim().replace(/\s/g, '');
}

function generateStudentId() {
  const rnd = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `STD-${rnd}`;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { firstName, lastName, email, cohortNumber, cohortName } = body || {};

    if (!firstName || !lastName || !email) {
      return NextResponse.json({ error: 'firstName, lastName, and email are required' }, { status: 400 });
    }

    const dbId = process.env.NOTION_PROFILE_DB_ID;
    const apiKey = process.env.NOTION_API_KEY;
    if (!dbId || !apiKey) {
      return NextResponse.json({ error: 'Profile DB or API key not configured' }, { status: 500 });
    }

    const database_id = cleanId(dbId);
    if (database_id.length < 32) {
      return NextResponse.json({ error: 'Invalid NOTION_PROFILE_DB_ID format' }, { status: 400 });
    }

    // Determine cohort index and year-based student id
    const cohortIdx = Number.parseInt(cohortNumber ?? '1', 10) || 1;
    const year = new Date().getFullYear();

    // Count existing registrations in this cohort to derive roll number
    let roll = 1;
    try {
      const countRes = await fetch('https://api.notion.com/v1/databases/' + database_id + '/query', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Notion-Version': '2022-06-28',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          filter: {
            property: 'Cohort',
            select: { equals: cohortName || `Cohort ${cohortIdx}` },
          },
          page_size: 100,
        }),
      });
      if (countRes.ok) {
        const countData = await countRes.json();
        const existing = Array.isArray(countData.results) ? countData.results.length : 0;
        roll = existing + 1;
      }
    } catch {
      // fallback to roll = 1
    }

    const studentId = `${cohortIdx}/${roll}/${year}`;

    const payload = {
      parent: { database_id },
      properties: {
        Name: {
          title: [
            {
              text: { content: `${firstName} ${lastName}`.trim() },
            },
          ],
        },
        Email: {
          email,
        },
        'Student ID': {
          rich_text: [
            {
              text: { content: studentId },
            },
          ],
        },
        Cohort: {
          select: { name: cohortName || `Cohort ${cohortIdx}` },
        },
        Status: {
          select: { name: 'New' },
        },
      },
    };

    const res = await fetch('https://api.notion.com/v1/pages', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Notion-Version': '2022-06-28',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return NextResponse.json(
        { error: 'Failed to create profile', details: err.message || `HTTP ${res.status}` },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json({ success: true, pageId: data.id, studentId }, { status: 200 });
  } catch (error: any) {
    console.error('Error creating profile:', error);
    return NextResponse.json({ error: 'Failed to create profile', details: error.message }, { status: 500 });
  }
}


