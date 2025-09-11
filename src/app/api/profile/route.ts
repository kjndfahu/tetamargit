import { NextRequest, NextResponse } from 'next/server';
import { LocalAuthService } from '@/lib/local-auth';

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, ...updates } = body;

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const updatedProfile = await LocalAuthService.updateUserProfile(userId, updates);

    return NextResponse.json({ profile: updatedProfile });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 400 }
    );
  }
}