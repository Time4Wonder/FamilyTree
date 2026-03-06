import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { existsSync, mkdirSync } from 'fs';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const personId = formData.get('personId') as string;
    const title = formData.get('title') as string || (file ? file.name : 'Unknown');

    if (!file || !personId) {
      return NextResponse.json({ error: 'Missing file or personId' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Make sure upload dir exists
    const uploadDir = join(process.cwd(), 'public', 'uploads');
    if (!existsSync(uploadDir)) {
      mkdirSync(uploadDir, { recursive: true });
    }

    // Save file
    const uniqueName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    const filePath = `/uploads/${uniqueName}`;
    const absolutePath = join(uploadDir, uniqueName);

    await writeFile(absolutePath, buffer);

    const document = await prisma.document.create({
      data: {
        title,
        filePath,
        fileType: file.type || 'application/octet-stream',
        personId,
      },
    });

    return NextResponse.json(document, { status: 201 });
  } catch (error) {
    console.error('Upload Error:', error);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
