import { NextRequest, NextResponse } from 'next/server';
import { LocalAuthService } from '@/lib/local-auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    const result = await LocalAuthService.signIn({ email, password });
    const profile = await LocalAuthService.getUserProfile(result.user.id);

    return NextResponse.json({
      user: result.user,
      profile,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 400 }
    );
  }
}