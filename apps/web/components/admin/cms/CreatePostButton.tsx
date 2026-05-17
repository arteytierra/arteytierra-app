'use client';

import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@arteytierra/ui';
import { createPost } from '@/lib/cms/actions';

export function CreatePostButton() {
  const router = useRouter();
  const [pending, start] = useTransition();
  return (
    <Button
      onClick={() =>
        start(async () => {
          const { id } = await createPost();
          router.push(`/admin/blog/${id}`);
        })
      }
      disabled={pending}
    >
      <Plus size={14} /> {pending ? 'Creando…' : 'Nuevo post'}
    </Button>
  );
}
