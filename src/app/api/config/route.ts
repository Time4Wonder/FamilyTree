import { NextResponse } from 'next/server';
import { setDataPath, getDataPath } from '@/lib/config';
import { resetPrisma } from '@/lib/prisma';
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

export async function GET() {
  return NextResponse.json({ path: getDataPath() });
}

export async function POST(req: Request) {
  try {
    const { dataPath, mode } = await req.json();
    if (!dataPath || typeof dataPath !== 'string') {
      return NextResponse.json({ error: 'Ungültiger Pfad' }, { status: 400 });
    }

    const dbDir = path.join(dataPath, 'database');
    const uploadsDir = path.join(dataPath, 'uploads');
    const dbPath = path.join(dbDir, 'dev.db');

    if (mode === 'import') {
      if (!fs.existsSync(dbPath)) {
        return NextResponse.json({ error: 'In diesem Verzeichnis wurde keine bestehende Datenbank gefunden.' }, { status: 400 });
      }
    } else {
      // mode === 'create'
      if (fs.existsSync(dbPath)) {
        return NextResponse.json({ error: 'In diesem Verzeichnis existiert bereits eine Datenbank. Bitte wähle "Importieren".' }, { status: 400 });
      }
    }

    if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true });
    if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

    setDataPath(dataPath);
    resetPrisma(); // Force Prisma to reconnect using new path

    // Initialize database schema at new location
    if (mode === 'create') {
      execSync('npx prisma db push', { 
      env: { 
        ...process.env, 
        DATABASE_URL: `file:${dbPath}` 
      },
      stdio: 'inherit'
    });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Config Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
