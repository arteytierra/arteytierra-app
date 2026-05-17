'use client';

import { useTransition, useState } from 'react';
import { Button } from '@arteytierra/ui';
import { publishPost } from '@/lib/cms/actions';

export function PublishToggle({ postId, isPublished }: { postId: string; isPublished: boolean }) {
  const [pub, setPub] = useState(isPublished);
  const [pending, start] = useTransition();
  return (
    <Button
      variant={pub ? 'outline' : 'clay'}
      size="sm"
      disabled={pending}
      onClick={() =>
        start(async () => {
          await publishPost(postId, !pub);
          setPub(!pub);
        })
      }
    >
      {pending ? '…' : pub ? 'Despublicar' : 'Publicar'}
    </Button>
  );
}
