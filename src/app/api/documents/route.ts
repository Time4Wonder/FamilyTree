import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { getDataPath } from '@/lib/config';

export async function POST(request: Request) {
  const dataPath = getDataPath();
  if (!dataPath) return NextResponse.json({ error: 'Data path not configured' }, { status: 503 });
  const UPLOAD_DIR = join(dataPath, 'uploads');
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const personId = formData.get('personId') as string;
    const title = formData.get('title') as string || (file ? file.name : 'Unknown');

    if (!file || !personId) {
      return NextResponse.json({ error: 'Missing file or personId' }, { status: 400 });
    }

    // Fetch person to get the name for the folder
    const person = await prisma.person.findUnique({ where: { id: personId } });
    if (!person) {
      return NextResponse.json({ error: 'Person not found' }, { status: 404 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create a clean folder name from the person's name
    const folderName = `${person.firstName}_${person.lastName}`.replace(/[^a-zA-Z0-9.-]/g, '_');
    const personUploadDir = join(UPLOAD_DIR, folderName);

    // Make sure upload dir exists
    if (!existsSync(personUploadDir)) {
      mkdirSync(personUploadDir, { recursive: true });
    }

    // Save file
    const uniqueName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    const filePath = `/api/file/${folderName}/${uniqueName}`;
    const absolutePath = join(personUploadDir, uniqueName);

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
