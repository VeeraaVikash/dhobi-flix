export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import {
  getProfileDownloads,
  getDownloadById,
  createDownload,
  updateDownload,
  deleteDownload,
  pauseDownload,
  resumeDownload,
  canDownload,
  validateDownloadRequest,
} from '@/services/download.service';
import { HTTP_STATUS } from '@/constants/app';
import type { DownloadCreateRequest, DownloadPatchBody } from '@/types/download';

export async function GET(req: NextRequest) {
  const profileId = req.nextUrl.searchParams.get('profileId');
  const downloadId = req.nextUrl.searchParams.get('id');

  if (downloadId) {
    const dl = getDownloadById(downloadId);
    if (!dl) {
      return NextResponse.json({ error: 'Download not found' }, { status: HTTP_STATUS.NOT_FOUND });
    }
    return NextResponse.json({ download: dl });
  }

  if (!profileId) {
    return NextResponse.json(
      { error: 'profileId or id query param is required' },
      { status: HTTP_STATUS.BAD_REQUEST }
    );
  }

  const downloads = getProfileDownloads(profileId);
  return NextResponse.json({ downloads });
}

export async function POST(req: NextRequest) {
  let body: DownloadCreateRequest;

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: HTTP_STATUS.BAD_REQUEST });
  }

  const validationError = validateDownloadRequest(body);
  if (validationError) {
    return NextResponse.json({ error: validationError }, { status: HTTP_STATUS.BAD_REQUEST });
  }

  if (!canDownload(body.profileId)) {
    return NextResponse.json(
      { error: 'Download limit reached for this plan' },
      { status: HTTP_STATUS.CONFLICT }
    );
  }

  const download = createDownload(body);
  return NextResponse.json({ download }, { status: HTTP_STATUS.CREATED });
}

export async function PATCH(req: NextRequest) {
  const id = req.nextUrl.searchParams.get('id');
  if (!id) {
    return NextResponse.json({ error: 'id query param is required' }, { status: HTTP_STATUS.BAD_REQUEST });
  }

  let body: DownloadPatchBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: HTTP_STATUS.BAD_REQUEST });
  }

  let result;

  if (body.action === 'pause') {
    result = pauseDownload(id);
  } else if (body.action === 'resume') {
    result = resumeDownload(id);
  } else if (body.action === 'update') {
    result = updateDownload(id, body.update ?? {});
  } else {
    return NextResponse.json({ error: 'Invalid action' }, { status: HTTP_STATUS.BAD_REQUEST });
  }

  if (!result) {
    return NextResponse.json(
      { error: 'Download not found or action not allowed in current state' },
      { status: HTTP_STATUS.NOT_FOUND }
    );
  }

  return NextResponse.json({ download: result });
}

export async function DELETE(req: NextRequest) {
  const id = req.nextUrl.searchParams.get('id');
  if (!id) {
    return NextResponse.json({ error: 'id query param is required' }, { status: HTTP_STATUS.BAD_REQUEST });
  }

  const deleted = deleteDownload(id);
  if (!deleted) {
    return NextResponse.json({ error: 'Download not found' }, { status: HTTP_STATUS.NOT_FOUND });
  }

  return new NextResponse(null, { status: HTTP_STATUS.NO_CONTENT });
}
