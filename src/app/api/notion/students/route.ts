import { NextResponse } from 'next/server';
import { queryDatabase, extractText } from '@/lib/notion';

export async function GET() {
  try {
    const databaseId = process.env.NOTION_STUDENTS_DB_ID;

    if (!databaseId) {
      return NextResponse.json(
        { error: 'NOTION_STUDENTS_DB_ID is not configured' },
        { status: 500 }
      );
    }

    const cleanDbId = databaseId.trim().replace(/\s/g, '');
    if (cleanDbId.length < 32) {
      return NextResponse.json(
        { error: 'Invalid NOTION_STUDENTS_DB_ID format', details: 'Database ID should be 32 characters (with or without hyphens)' },
        { status: 400 }
      );
    }

    const results = await queryDatabase(cleanDbId);

    const students = results.map((page: any) => {
      const properties = page.properties || {};

      const getNumber = (propName: string): number => {
        const val = properties[propName];
        if (!val) return 0;
        if (typeof val.number === 'number') return val.number;
        if (typeof val.formula?.number === 'number') return val.formula.number;
        if (typeof val.rollup?.number === 'number') return val.rollup.number;
        return 0;
      };

      const getPercent = (propName: string): number => {
        const num = getNumber(propName);
        // If the stored value is a fraction (0-1), convert to percent
        if (num > 0 && num <= 1) return Math.round(num * 100);
        return Math.round(num);
      };

      const getText = (propName: string): string => {
        const val = properties[propName];
        if (!val) return '';
        if (Array.isArray(val.rich_text)) return extractText(val.rich_text);
        if (Array.isArray(val.title)) return extractText(val.title);
        if (typeof val.email === 'string') return val.email;
        if (typeof val.phone_number === 'string') return val.phone_number;
        return '';
      };

      const getSelect = (propName: string): string => {
        const val = properties[propName];
        return val?.select?.name || '';
      };

      const getRelationNames = (propName: string): string[] => {
        const rel = properties[propName]?.relation;
        if (!Array.isArray(rel) || rel.length === 0) return [];
        // we only have relation ids; names are not directly available without extra queries
        return rel.map((r: any) => r.id).filter(Boolean);
      };

      return {
        id: page.id,
        name: extractText(properties['Name']?.title || []),
        email: properties['Email']?.email || '',
        phone: properties['Phone']?.phone_number || getText('Phone'),
        country: getText('Country'),
        status: getSelect('Status'),
        cohorts: getRelationNames('Cohorts'),
        progressPercent: getPercent('Progress %'),
        chaptersCompleted: getPercent('Chapters Completed'),
        assignmentsCompleted: getPercent('Assignments Completed'),
        attendancePercent: getPercent('Attendance %'),
        satsEarned: getNumber('Sats Earned'),
        satsPending: getNumber('Sats Pending'),
      };
    });

    // Sort: prefer Active, then Applicant/Registered, then the rest
    const statusRank: Record<string, number> = {
      Active: 0,
      Registered: 1,
      Applicant: 2,
      Graduated: 3,
      Dropped: 4,
    };
    students.sort((a: any, b: any) => {
      const ra = statusRank[a.status] ?? 99;
      const rb = statusRank[b.status] ?? 99;
      return ra - rb;
    });

    return NextResponse.json({ students });
  } catch (error: any) {
    console.error('Error fetching students from Notion:', error);
    return NextResponse.json(
      { error: 'Failed to fetch students', details: error.message },
      { status: 500 }
    );
  }
}


