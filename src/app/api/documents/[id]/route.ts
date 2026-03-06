import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { unlink } from 'fs/promises';
import { join } from 'path';
import { getDataPath } from '@/lib/config';

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const dataPath = getDataPath();
  const UPLOAD_DIR = dataPath ? join(dataPath, 'uploads') : '';
  try {
    const document = await prisma.document.findUnique({ where: { id: params.id } });
    
    if (!document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    // Delete file
    try {
      // document.filePath could be `/api/file/Max_Mustermann/xyz.pdf` or `/api/file/xyz.pdf` or `/uploads/xyz.pdf`
      const pathParts = document.filePath.split('/');
      const filename = pathParts.pop() || '';
      
      let absolutePath = '';
      if (document.filePath.includes('/api/file/') && pathParts.length > 3) {
        // New structure: /api/file/[personName]/[filename]
        const personFolder = pathParts.pop() || '';
        absolutePath = join(UPLOAD_DIR, personFolder, filename);
      } else {
        // Old structure (in root /uploads/)
        absolutePath = join(UPLOAD_DIR, filename);
      }
      
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
