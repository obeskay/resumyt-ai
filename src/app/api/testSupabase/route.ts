import { NextRequest, NextResponse } from 'next/server';
import { getSupabase, getOrCreateAnonymousUser } from '@/lib/supabase';
import requestIp from 'request-ip';

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase.from('anonymous_users').select('count').single();
    
    if (error) {
      console.error('Supabase connection test failed:', error);
      return NextResponse.json({ message: 'Supabase connection test failed', error: error.message }, { status: 500 });
    }

    const userIp = requestIp.getClientIp(request as any) || '127.0.0.1';
    console.log('User IP:', userIp);

    const user = await getOrCreateAnonymousUser(userIp);
    if (!user) {
      return NextResponse.json({ message: 'Failed to get or create anonymous user' }, { status: 500 });
    }

    return NextResponse.json({ 
      message: 'Supabase connection test successful',
      rowCount: data.count,
      user: {
        id: user.id,
        transcriptions_used: user.transcriptions_used
      }
    });
  } catch (error) {
    console.error('Error in Supabase test route:', error);
    return NextResponse.json({ message: 'Internal server error', error: String(error) }, { status: 500 });
  }
}
