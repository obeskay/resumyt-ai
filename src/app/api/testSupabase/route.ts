import { NextRequest, NextResponse } from 'next/server';
import { testSupabaseConnection, getOrCreateAnonymousUser } from '@/lib/supabase';
import requestIp from 'request-ip';

export async function GET(request: NextRequest) {
  try {
    const connectionTest = await testSupabaseConnection();
    if (!connectionTest) {
      return NextResponse.json({ message: 'Supabase connection test failed' }, { status: 500 });
    }

    const userIp = requestIp.getClientIp(request as any) || '127.0.0.1';
    console.log('User IP:', userIp);

    const user = await getOrCreateAnonymousUser(userIp);
    if (!user) {
      return NextResponse.json({ message: 'Failed to get or create anonymous user' }, { status: 500 });
    }

    return NextResponse.json({ 
      message: 'Supabase connection test successful',
      user: {
        id: user.id,
        // Only include transcriptions_used if it exists on the user object
        ...(user.transcriptions_used !== undefined && { transcriptions_used: user.transcriptions_used })
      }
    });
  } catch (error) {
    console.error('Error in Supabase test route:', error);
    return NextResponse.json({ message: 'Internal server error', error: String(error) }, { status: 500 });
  }
}
