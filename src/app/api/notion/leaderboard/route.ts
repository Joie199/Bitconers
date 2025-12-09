import { NextResponse } from 'next/server';

async function resolveNames(ids: string[], apiKey: string) {
  const map: Record<string, string> = {};
  const headers = {
    Authorization: `Bearer ${apiKey}`,
    'Notion-Version': '2022-06-28',
    'Content-Type': 'application/json',
  };
  const capped = ids.slice(0, 50); // safety cap
  for (const id of capped) {
    try {
      const res = await fetch(`https://api.notion.com/v1/pages/${id}`, { headers });
      if (!res.ok) continue;
      const page = await res.json();
      const title =
        page?.properties?.Name?.title?.[0]?.plain_text ||
        page?.properties?.['Student Name']?.title?.[0]?.plain_text ||
        page?.properties?.['Name']?.rich_text?.[0]?.plain_text;
      if (title) {
        map[id] = title;
      }
    } catch {
      // ignore
    }
  }
  return map;
}

export async function GET() {
  try {
    const databaseId = process.env.NOTION_SATS_REWARDS_DB_ID;
    const apiKey = process.env.NOTION_API_KEY;

    if (!databaseId || !apiKey) {
      return NextResponse.json(
        { error: 'NOTION_SATS_REWARDS_DB_ID or NOTION_API_KEY not configured' },
        { status: 500 }
      );
    }

    const cleanDbId = databaseId.trim().replace(/\s/g, '');
    if (cleanDbId.length < 32) {
      return NextResponse.json(
        { error: 'Invalid NOTION_SATS_REWARDS_DB_ID format' },
        { status: 400 }
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

    const relationIds = new Set<string>();
    const totals: Record<string, { sats: number; awards: number; id?: string }> = {};

    results.forEach((page: any) => {
      const props = page.properties || {};
      const relation = props['Student']?.relation;
      if (Array.isArray(relation)) {
        relation.forEach((rel: any) => rel?.id && relationIds.add(rel.id));
      }
      const nameFromTitle = props['Name']?.title?.[0]?.plain_text;
      const name =
        props['Student']?.people?.[0]?.name ||
        nameFromTitle ||
        (relation && relation[0]?.id) ||
        'Unknown';

      const amountPaid =
        props['AmountPaid']?.formula?.number ??
        props['AmountPaid']?.number ??
        props['Amount']?.number ??
        0;

      if (!totals[name]) {
        totals[name] = { sats: 0, awards: 0, id: relation?.[0]?.id };
      }
      totals[name].sats += amountPaid || 0;
      totals[name].awards += 1;
    });

    const relationIdToName = await resolveNames(Array.from(relationIds), apiKey);

    const remapped: Record<string, { sats: number; awards: number }> = {};
    Object.entries(totals).forEach(([name, val]) => {
      const resolved = val.id && relationIdToName[val.id] ? relationIdToName[val.id] : name;
      if (!remapped[resolved]) {
        remapped[resolved] = { sats: 0, awards: 0 };
      }
      remapped[resolved].sats += val.sats;
      remapped[resolved].awards += val.awards;
    });

    const leaderboard = Object.entries(remapped)
      .map(([name, val]) => ({ name, sats: val.sats, awards: val.awards }))
      .sort((a, b) => b.sats - a.sats || b.awards - a.awards)
      .map((item, idx) => ({ ...item, rank: idx + 1 }));

    return NextResponse.json({ leaderboard }, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching sats leaderboard:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sats leaderboard', details: error.message },
      { status: 500 }
    );
  }
}


