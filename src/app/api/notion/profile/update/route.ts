import { NextRequest, NextResponse } from 'next/server';

function cleanId(id: string) {
  return id.trim().replace(/\s/g, '');
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, name, phone, country, city } = body || {};

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

    // First, find the profile by email
    const queryRes = await fetch('https://api.notion.com/v1/databases/' + database_id + '/query', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Notion-Version': '2022-06-28',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        filter: {
          property: 'Email',
          email: { equals: email },
        },
        page_size: 1,
      }),
    });

    if (!queryRes.ok) {
      const err = await queryRes.json().catch(() => ({}));
      return NextResponse.json(
        { error: 'Failed to find profile', details: err.message || `HTTP ${queryRes.status}` },
        { status: queryRes.status }
      );
    }

    const queryData = await queryRes.json();
    const page = queryData.results?.[0];
    if (!page) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    // Update the page
    const updateProps: any = {};
    if (name) {
      updateProps['Name'] = {
        title: [{ text: { content: name } }],
      };
    }
    if (phone) {
      updateProps['Phone'] = {
        rich_text: [{ text: { content: phone } }],
      };
    }
    if (country) {
      updateProps['Country'] = {
        rich_text: [{ text: { content: country } }],
      };
    }
    if (city) {
      updateProps['City'] = {
        rich_text: [{ text: { content: city } }],
      };
    }

    const updateRes = await fetch('https://api.notion.com/v1/pages/' + page.id, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Notion-Version': '2022-06-28',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ properties: updateProps }),
    });

    if (!updateRes.ok) {
      const err = await updateRes.json().catch(() => ({}));
      return NextResponse.json(
        { error: 'Failed to update profile', details: err.message || `HTTP ${updateRes.status}` },
        { status: updateRes.status }
      );
    }

    const updatedPage = await updateRes.json();
    const props = updatedPage.properties || {};
    const profileName = props['Name']?.title?.[0]?.plain_text || '';
    const studentId = props['Student ID']?.rich_text?.[0]?.plain_text || '';
    const status = props['Status']?.select?.name || '';

    return NextResponse.json(
      {
        success: true,
        profile: {
          id: updatedPage.id,
          name: profileName,
          email: email,
          studentId,
          status,
          phone: props['Phone']?.rich_text?.[0]?.plain_text || '',
          country: props['Country']?.rich_text?.[0]?.plain_text || '',
          city: props['City']?.rich_text?.[0]?.plain_text || '',
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error updating profile:', error);
    return NextResponse.json({ error: 'Failed to update profile', details: error.message }, { status: 500 });
  }
}

