import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createComponentBackup, ChangeSource } from '@/lib/components/backup';
import { readFile } from 'fs/promises';
import { join } from 'path';

// Verify admin session
async function isAdmin(): Promise<boolean> {
  const cookieStore = await cookies();
  const session = cookieStore.get('admin_session');
  return !!session?.value;
}

export async function POST(request: NextRequest) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const {
      componentName,
      componentPath,
      sourceCode,
      versionTag,
      changeSummary,
      changedBy,
      changeSource,
      dependencies,
      gitCommitHash,
      gitBranch,
      isProduction,
      readFromFile,
    } = body;

    if (!componentName || !componentPath) {
      return NextResponse.json(
        { error: 'componentName and componentPath are required' },
        { status: 400 }
      );
    }

    let code = sourceCode;

    // If readFromFile is true, read the component from the file system
    if (readFromFile && !sourceCode) {
      try {
        const fullPath = join(process.cwd(), componentPath);
        code = await readFile(fullPath, 'utf-8');
      } catch (err) {
        return NextResponse.json(
          { error: `Failed to read file: ${componentPath}` },
          { status: 400 }
        );
      }
    }

    if (!code) {
      return NextResponse.json(
        { error: 'sourceCode is required (or use readFromFile: true)' },
        { status: 400 }
      );
    }

    const result = await createComponentBackup({
      componentName,
      componentPath,
      sourceCode: code,
      versionTag,
      changeSummary,
      changedBy: changedBy || 'admin',
      changeSource: (changeSource as ChangeSource) || 'manual',
      dependencies,
      gitCommitHash,
      gitBranch,
      isProduction,
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      backup: {
        id: result.backup!.id,
        version_number: result.backup!.version_number,
        source_hash: result.backup!.source_hash,
        file_size_bytes: result.backup!.file_size_bytes,
        line_count: result.backup!.line_count,
      },
    });
  } catch (err) {
    console.error('Backup error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
