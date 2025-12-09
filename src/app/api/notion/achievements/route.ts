import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const databaseId = process.env.NOTION_ACHIEVEMENTS_DB_ID;

    if (!databaseId) {
      return NextResponse.json(
        { error: 'Notion Achievements database ID not configured' },
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
          error: 'Failed to fetch achievements from Notion',
          details: errorData.message || `HTTP ${response.status}`,
          code: errorData.code,
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    const results = data.results || [];

    // Collect relation ids to resolve names
    const relationIds = new Set<string>();

    // Aggregate points by student (keyed by resolved name or relation id)
    const totals: Record<string, { points: number; awards: number; id?: string }> = {};

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
      const points =
        props['Points']?.number ??
        props['Points']?.formula?.number ??
        0;

      if (!totals[name]) {
        totals[name] = { points: 0, awards: 0, id: relation?.[0]?.id };
      }
      totals[name].points += points || 0;
      totals[name].awards += 1;
    });

    // Resolve relation ids to names (simple best-effort)
    const relationIdToName: Record<string, string> = {};
    if (relationIds.size > 0) {
      const apiKey = process.env.NOTION_API_KEY!;
      const headers = {
        Authorization: `Bearer ${apiKey}`,
        'Notion-Version': '2022-06-28',
        'Content-Type': 'application/json',
      };
      const ids = Array.from(relationIds).slice(0, 50); // safety cap
      for (const id of ids) {
        try {
          const res = await fetch(`https://api.notion.com/v1/pages/${id}`, { headers });
          if (res.ok) {
            const page = await res.json();
            const title =
              page?.properties?.Name?.title?.[0]?.plain_text ||
              page?.properties?.['Student Name']?.title?.[0]?.plain_text ||
              page?.properties?.['Name']?.rich_text?.[0]?.plain_text;
            if (title) {
              relationIdToName[id] = title;
            }
          }
        } catch {
          // ignore individual failures
        }
      }
    }

    // Remap totals with resolved names when possible
    const remappedTotals: Record<string, { points: number; awards: number }> = {};
    Object.entries(totals).forEach(([name, val]) => {
      const resolvedName = val.id && relationIdToName[val.id] ? relationIdToName[val.id] : name;
      if (!remappedTotals[resolvedName]) {
        remappedTotals[resolvedName] = { points: 0, awards: 0 };
      }
      remappedTotals[resolvedName].points += val.points;
      remappedTotals[resolvedName].awards += val.awards;
    });

    const leaderboard = Object.entries(remappedTotals)
      .map(([name, val]) => ({
        name,
        points: val.points,
        awards: val.awards,
      }))
      .sort((a, b) => b.points - a.points || b.awards - a.awards)
      .map((item, idx) => ({ ...item, rank: idx + 1 }));

    return NextResponse.json({ leaderboard }, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching achievements from Notion:', error);
    return NextResponse.json(
      { error: 'Failed to fetch achievements', details: error.message },
      { status: 500 }
    );
  }
}


