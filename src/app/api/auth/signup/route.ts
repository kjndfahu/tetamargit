import { NextRequest, NextResponse } from 'next/server';
import { LocalAuthService } from '@/lib/local-auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, firstName, lastName, phone } = body;

    if (!email || !password || !firstName || !lastName) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const result = await LocalAuthService.signUp({
      email,
      password,
      firstName,
      lastName,
      phone,
    });

    return NextResponse.json({
      user: result.user,
      profile: result.profile,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 400 }
    );
  }
}