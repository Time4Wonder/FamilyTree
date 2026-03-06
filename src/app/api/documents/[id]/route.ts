import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { unlink } from 'fs/promises';
import { join } from 'path';

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const document = await prisma.document.findUnique({ where: { id: params.id } });
    
    if (!document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    // Delete file
    try {
      const absolutePath = join(process.cwd(), 'public', document.filePath);
      await unlink(absolutePath);
    } catch (e) {
      console.warn("Could not delete file from filesystem", e);
    }

    await prisma.document.delete({ where: { id: params.id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete data' }, { status: 500 });
  }
}
