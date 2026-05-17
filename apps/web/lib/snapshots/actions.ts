'use server';

import { revalidatePath } from 'next/cache';
import { requireStaff } from '@/lib/auth/session';
import { runSnapshot, getSnapshotFileUrl } from '@/lib/snapshots';

export async function runSnapshotAction() {
  const user = await requireStaff();
  const result = await runSnapshot({ createdBy: user.id, kind: 'manual' });
  revalidatePath('/admin/snapshots');
  return result;
}

export async function getSnapshotDownloadUrlAction(snapshotId: string, file: string) {
  await requireStaff();
  const url = await getSnapshotFileUrl(snapshotId, file);
  return { url };
}
