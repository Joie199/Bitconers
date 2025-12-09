import { NextRequest, NextResponse } from 'next/server';

function cleanId(id: string) {
  return id.trim().replace(/\s/g, '');
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email } = body || {};

    if (!email) {
      return NextResponse.json({ error: 'email is required' }, { status: 400 });
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

    const query = {
      filter: {
        property: 'Email',
        email: { equals: email },
      },
      page_size: 1,
    };

    const res = await fetch('https://api.notion.com/v1/databases/' + database_id + '/query', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Notion-Version': '2022-06-28',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(query),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return NextResponse.json(
        { error: 'Failed to query profile', details: err.message || `HTTP ${res.status}` },
        { status: res.status }
      );
    }

    const data = await res.json();
    const match = data.results?.[0];
    if (!match) {
      return NextResponse.json({ found: false }, { status: 200 });
    }

    const props = match.properties || {};
    const name =
      props['Name']?.title?.[0]?.plain_text ||
      props['Student Name']?.title?.[0]?.plain_text ||
      'Student';
    const studentId = props['Student ID']?.rich_text?.[0]?.plain_text || '';
    const status = props['Status']?.select?.name || '';

    return NextResponse.json(
      {
        found: true,
        profile: {
          id: match.id,
          name,
          email,
          studentId,
          status,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error querying profile:', error);
    return NextResponse.json({ error: 'Failed to query profile', details: error.message }, { status: 500 });
  }
}


