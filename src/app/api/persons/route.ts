import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const persons = await prisma.person.findMany({
      include: {
        mother: true,
        father: true,
        documents: true,
        motherChildren: true,
        fatherChildren: true,
      },
    });
    return NextResponse.json(persons);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch persons' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { firstName, lastName, birthDate, deathDate, avatarUrl, motherId, fatherId } = body;

    const person = await prisma.person.create({
      data: {
        firstName,
        lastName,
        birthDate: birthDate ? new Date(birthDate) : null,
        deathDate: deathDate ? new Date(deathDate) : null,
        avatarUrl,
        motherId: motherId || null,
        fatherId: fatherId || null,
      },
    });

    return NextResponse.json(person, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to create person' }, { status: 500 });
  }
}
