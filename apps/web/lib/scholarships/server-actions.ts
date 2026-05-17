'use server';

import 'server-only';
import { requireStaff } from '@/lib/auth/session';
import { getEvidenceDownloadUrl } from './index';

export async function getEvidenceUrlAction(path: string) {
  await requireStaff();
  return await getEvidenceDownloadUrl(path);
}
