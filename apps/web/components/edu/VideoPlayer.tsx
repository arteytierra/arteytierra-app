'use client';

import { useEffect, useRef, useState } from 'react';
import { trackLessonProgress } from '@/lib/edu/actions';

interface Props {
  lessonId: string;
  provider: string | null;
  videoId: string | null;
  resourceUrl: string | null;
  initialWatchedSec?: number;
  alreadyCompleted?: boolean;
}

/**
 * Player tolerante:
 *  - youtube → iframe (sin tracking fino)
 *  - mux → mux-player (lazy)
 *  - cloudflare → <iframe> stream
 *  - html5/url → <video controls>
 * Trackea progreso server-side cada 10s. Marca completed al 95%.
 */
export function VideoPlayer({
  lessonId,
  provider,
  videoId,
  resourceUrl,
  initialWatchedSec = 0,
  alreadyCompleted = false,
}: Props) {
  const ref = useRef<HTMLVideoElement>(null);
  const lastSent = useRef(initialWatchedSec);
  const completedRef = useRef(alreadyCompleted);

  // YouTube
  if (provider === 'youtube' && videoId) {
    return (
      <Box>
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${videoId}?rel=0&modestbranding=1`}
          title="Lección"
          allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          className="absolute inset-0 w-full h-full"
        />
      </Box>
    );
  }

  // Cloudflare Stream
  if (provider === 'cloudflare' && videoId) {
    return (
      <Box>
        <iframe
          src={`https://iframe.videodelivery.net/${videoId}`}
          allow="accelerometer; gyroscope; encrypted-media; picture-in-picture;"
          allowFullScreen
          className="absolute inset-0 w-full h-full"
        />
      </Box>
    );
  }

  // Vimeo
  if (provider === 'vimeo' && videoId) {
    return (
      <Box>
        <iframe
          src={`https://player.vimeo.com/video/${videoId}`}
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 w-full h-full"
        />
      </Box>
    );
  }

  // Mux player o HTML5 directo
  return (
    <Box>
      <video
        ref={ref}
        controls
        controlsList="nodownload"
        playsInline
        className="absolute inset-0 w-full h-full bg-ink-950 object-contain"
        src={
          provider === 'mux' && videoId
            ? `https://stream.mux.com/${videoId}.m3u8`
            : resourceUrl ?? undefined
        }
        onLoadedMetadata={() => {
          if (ref.current && initialWatchedSec > 0) {
            ref.current.currentTime = initialWatchedSec;
          }
        }}
        onTimeUpdate={() => {
          const v = ref.current;
          if (!v) return;
          const sec = Math.floor(v.currentTime);
          const dur = v.duration || 0;

          // Marcar completado al 95%
          if (!completedRef.current && dur > 0 && sec / dur >= 0.95) {
            completedRef.current = true;
            void trackLessonProgress({ lessonId, watchedSec: sec, completed: true });
            return;
          }

          // Throttle 10s
          if (sec - lastSent.current >= 10) {
            lastSent.current = sec;
            void trackLessonProgress({ lessonId, watchedSec: sec, completed: false });
          }
        }}
      />
    </Box>
  );
}

function Box({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative w-full overflow-hidden rounded-2xl bg-ink-950" style={{ aspectRatio: '16/9' }}>
      {children}
    </div>
  );
}
