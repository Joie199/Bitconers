import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const databaseId = process.env.NOTION_SATS_REWARDS_DB_ID;

    if (!databaseId) {
      return NextResponse.json(
        { error: 'Notion Sats Rewards database ID not configured' },
        { status: 500 }
      );
    }

    const cleanDbId = databaseId.trim().replace(/\s/g, '');
    if (cleanDbId.length < 32) {
      return NextResponse.json(
        { error: 'Invalid database ID format' },
        { status: 400 }
      );
    }

    const apiKey = process.env.NOTION_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Notion API key not configured' },
        { status: 500 }
      );
    }

    const response = await fetch(`https://api.notion.com/v1/databases/${cleanDbId}/query`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Notion-Version': '2022-06-28',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        {
          error: 'Failed to fetch sats rewards from Notion',
          details: errorData.message || `HTTP ${response.status}`,
          code: errorData.code,
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    const results = data.results || [];

    let totalPaid = 0;
    let totalPending = 0;

    results.forEach((page: any) => {
      const props = page.properties || {};
      const amountPaid = props['AmountPaid']?.formula?.number ?? props['AmountPaid']?.number ?? 0;
      const amountPending = props['AmountPending']?.formula?.number ?? props['AmountPending']?.number ?? 0;
      totalPaid += amountPaid || 0;
      totalPending += amountPending || 0;
    });

    return NextResponse.json(
      {
        totalPaid,
        totalPending,
        count: results.length,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error fetching sats rewards from Notion:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sats rewards', details: error.message },
      { status: 500 }
    );
  }
}


