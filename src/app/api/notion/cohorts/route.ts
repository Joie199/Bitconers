import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const databaseId = process.env.NOTION_COHORTS_DB_ID;
    const apiKey = process.env.NOTION_API_KEY;

    if (!databaseId) {
      return NextResponse.json(
        { error: 'Notion database ID not configured' },
        { status: 500 }
      );
    }

    if (!apiKey) {
      return NextResponse.json(
        { error: 'Notion API key not configured' },
        { status: 500 }
      );
    }

    // Clean the database ID - remove any whitespace
    const cleanDbId = databaseId.trim().replace(/\s/g, '');

    // Fetch from Notion API directly
    const response = await fetch(`https://api.notion.com/v1/databases/${cleanDbId}/query`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Notion-Version': '2022-06-28',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { 
          error: 'Failed to fetch cohorts from Notion',
          details: errorData.message || `HTTP ${response.status}`,
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    const results = data.results || [];

    // Fetch enrollment data to count students per cohort
    const enrollmentDbId = process.env.NOTION_COHORT_ENROLLMENT_DB_ID;
    let enrollmentCounts: Record<string, number> = {};
    
    if (enrollmentDbId) {
      try {
        const cleanEnrollmentDbId = enrollmentDbId.trim().replace(/\s/g, '');
        const enrollmentResponse = await fetch(`https://api.notion.com/v1/databases/${cleanEnrollmentDbId}/query`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Notion-Version': '2022-06-28',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({}),
        });

        if (enrollmentResponse.ok) {
          const enrollmentData = await enrollmentResponse.json();
          const enrollments = enrollmentData.results || [];
          
          // Count enrollments per cohort
          enrollments.forEach((enrollment: any) => {
            const props = enrollment.properties || {};
            // Try different property names for cohort relation
            const cohortRelation = props['Cohort']?.relation || 
                                 props['Cohort Name']?.relation ||
                                 props['cohort']?.relation;
            
            if (cohortRelation && cohortRelation.length > 0) {
              const cohortId = cohortRelation[0].id;
              enrollmentCounts[cohortId] = (enrollmentCounts[cohortId] || 0) + 1;
            }
          });
        }
      } catch (enrollmentError) {
        console.error('Error fetching enrollment data:', enrollmentError);
        // Continue without enrollment data
      }
    }

    // Transform Notion results to your format
    const cohorts = results.map((page: any) => {
      const properties = page.properties || {};
      
      // Extract name
      const name = properties.Name?.title?.[0]?.plain_text || 
                  properties['Cohort Name']?.title?.[0]?.plain_text || 
                  'Unnamed Cohort';
      
      // Try different property name variations for dates
      const startDateProp = properties['Start Date']?.date || 
                           properties['Start date']?.date || 
                           properties['StartDate']?.date ||
                           properties['start date']?.date ||
                           properties['Start']?.date;
      
      const endDateProp = properties['End Date']?.date || 
                         properties['End date']?.date || 
                         properties['EndDate']?.date ||
                         properties['end date']?.date ||
                         properties['End']?.date;
      
      // Extract date values
      const startDate = startDateProp?.start || '';
      const endDate = endDateProp?.start || '';
      
      // Extract other properties
      const status = properties.Status?.select?.name || '';
      const sessions = properties['Sessions']?.number || 
                     properties['sessions']?.number || 
                     0;
      const level = properties.Level?.select?.name || 'Beginner';
      
      // Get total seats (if available in database)
      const totalSeats = properties['Seats']?.number || 
                        properties['Total Seats']?.number || 
                        properties['seats']?.number || 
                        0;
      
      // Calculate available seats based on enrollments
      const enrolled = enrollmentCounts[page.id] || 0;
      const available = Math.max(0, totalSeats - enrolled);
      
      return {
        id: page.id,
        name: name,
        startDate: startDate,
        endDate: endDate,
        status: status,
        sessions: sessions,
        level: level,
        seats: totalSeats,
        available: available,
        enrolled: enrolled,
      };
    });

    return NextResponse.json({ cohorts }, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching cohorts from Notion:', error);
    return NextResponse.json(
      { error: 'Failed to fetch cohorts', details: error.message },
      { status: 500 }
    );
  }
}

