'use client';

import { useState } from 'react';
import { getSnapshotDownloadUrlAction } from '@/lib/snapshots/actions';

export function SnapshotFileDownload({
  snapshotId,
  files,
}: {
  snapshotId: string;
  files: string[];
}) {
  const [selected, setSelected] = useState(files[0] ?? '');
  const [pending, setPending] = useState(false);

  async function download() {
    if (!selected) return;
    setPending(true);
    try {
      const { url } = await getSnapshotDownloadUrlAction(snapshotId, selected);
      if (url) window.open(url, '_blank');
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="flex items-center gap-2">
      <select
        value={selected}
        onChange={(e) => setSelected(e.target.value)}
        className="text-xs rounded border border-ink/15 px-2 py-1 max-w-[180px]"
      >
        {files.map((f) => (
          <option key={f} value={f}>{f}</option>
        ))}
      </select>
      <button
        onClick={download}
        disabled={pending || !selected}
        className="text-xs rounded border border-ink/15 px-2 py-1 hover:bg-bone-100 disabled:opacity-50"
      >
        {pending ? '…' : 'Descargar'}
      </button>
    </div>
  );
}
