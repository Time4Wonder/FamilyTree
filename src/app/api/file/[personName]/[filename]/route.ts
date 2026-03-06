import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { getDataPath } from '@/lib/config';

export async function GET(request: Request, { params }: { params: { personName: string, filename: string } }) {
  const dataPath = getDataPath();
  if (!dataPath) return new NextResponse('Not configured', { status: 503 });
  
  const { personName, filename } = params;
  if (!personName || !filename) {
    return new NextResponse('File or Person not specified', { status: 400 });
  }

  // Construct path including the person's directory
  // Next.js params URL decode automatically: "Max_Mustermann" -> "Max_Mustermann"
  const UPLOAD_DIR = path.join(dataPath, 'uploads', personName);
  const filePath = path.join(UPLOAD_DIR, filename);

  try {
    // Check if the file exists
    if (!fs.existsSync(filePath)) {
      return new NextResponse('File not found', { status: 404 });
    }

    // Read the file securely without exposing the path
    const fileBuffer = fs.readFileSync(filePath);

    // Simple mime-type guessing to help the browser render images/pdfs inline
    let contentType = 'application/octet-stream';
    if (filename.match(/\.jpe?g$/i)) contentType = 'image/jpeg';
    else if (filename.match(/\.png$/i)) contentType = 'image/png';
    else if (filename.match(/\.gif$/i)) contentType = 'image/gif';
    else if (filename.match(/\.pdf$/i)) contentType = 'application/pdf';
    else if (filename.match(/\.te?xt$/i)) contentType = 'text/plain';

    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400',
      },
    });
  } catch (error) {
    console.error('Error serving file:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
