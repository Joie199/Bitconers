import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    // Get optional cohort_id filter from query params
    const searchParams = request.nextUrl.searchParams;
    const cohortId = searchParams.get('cohort_id');

    // Build the query - fetch all events from database
    let query = supabase
      .from('events')
      .select('*');

    // Filter events based on cohort_id
    // Logic:
    // - If cohort_id is NULL in database → Event is for EVERYONE (visible to all)
    // - If cohort_id is set in database → Event is for SPECIFIC COHORT only
    // - If user provides cohortId → Show: (events for everyone) OR (events for their cohort)
    // - If user doesn't provide cohortId → Show only: (events for everyone)
    
    if (cohortId) {
      // User has a cohort - show events for everyone AND events for their cohort
      query = query.or(`cohort_id.is.null,cohort_id.eq.${cohortId}`);
    } else {
      // User has no cohort - show only events for everyone
      query = query.is('cohort_id', null);
    }

    // Order by start_time (most recent first, then upcoming)
    const { data: events, error } = await query.order('start_time', { ascending: true });

    if (error) {
      console.error('Error fetching events:', error);
      return NextResponse.json(
        { error: 'Failed to fetch events', details: error.message },
        { status: 500 }
      );
    }

    // Transform events from database to match expected format
    const transformedEvents = (events || []).map((event: any) => {
      const startTime = event.start_time ? new Date(event.start_time) : null;
      const endTime = event.end_time ? new Date(event.end_time) : null;

      // Determine event type (default to 'community' if not set)
      type EventType = 'live-class' | 'assignment' | 'community' | 'workshop' | 'deadline' | 'quiz' | 'cohort';
      let eventType: EventType = 'community';
      if (event.type) {
        const normalizedType = event.type.toLowerCase().trim();
        const typeMap: Record<string, EventType> = {
          'live-class': 'live-class',
          'live class': 'live-class',
          'live session': 'live-class',
          'live': 'live-class',
          'assignment': 'assignment',
          'office hours': 'community',
          'community': 'community',
          'deadline': 'deadline',
          'workshop': 'workshop',
          'quiz': 'quiz',
          'cohort': 'cohort',
        };
        eventType = typeMap[normalizedType] || 'community';
      }

      // Format time string
      let timeString = '';
      if (startTime) {
        timeString = startTime.toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit',
          hour12: true 
        });
      }

      return {
        id: event.id,
        title: event.name || 'Untitled Event',
        date: startTime ? startTime.toISOString() : new Date().toISOString(),
        type: eventType,
        time: timeString,
        description: event.description || '',
        link: event.link || '#',
        recordingUrl: event.recording_url || null,
        endTime: endTime ? endTime.toISOString() : null,
        cohortId: event.cohort_id || null,
        isForEveryone: !event.cohort_id, // true if event is for everyone
      };
    });

    return NextResponse.json({ events: transformedEvents }, { status: 200 });
  } catch (error: any) {
    console.error('Error in events API:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

