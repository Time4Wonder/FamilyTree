import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const person = await prisma.person.findUnique({
      where: { id: params.id },
      include: {
        mother: true,
        father: true,
        documents: true,
        motherChildren: true,
        fatherChildren: true,
      },
    });

    if (!person) {
      return NextResponse.json({ error: 'Person not found' }, { status: 404 });
    }

    return NextResponse.json(person);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch person' }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const body = await request.json();
    const { firstName, lastName, birthDate, deathDate, avatarUrl, motherId, fatherId } = body;

    const person = await prisma.person.update({
      where: { id: params.id },
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

    return NextResponse.json(person);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to update person' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    await prisma.person.delete({
      where: { id: params.id },
    });
    return NextResponse.json({ message: 'Person deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete person' }, { status: 500 });
  }
}
