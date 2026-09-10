'use client';
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { registrarRecorrido } from '@/lib/telemetria';
export function ProductJourneyTracker() { const pathname = usePathname(); useEffect(() => { void registrarRecorrido('page_view', pathname); }, [pathname]); return null; }
