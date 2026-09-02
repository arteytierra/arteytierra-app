'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { calcularSombras, salidaPuesta } from '@/lib/sombras';
import { calcularInsolacion, type ResultadoInsolacion } from '@/lib/insolacion';
import { PRESETS_OBJETO, type ObjetoSombra } from '@/lib/objetosSombra';
import type { DatosShader } from '@/lib/shaders';
import type { Zona } from '@/lib/zonificacion';
import type { ElementoDibujo } from '@/lib/dibujos';

type Vertice = { lat: number; lng: number };

interface Params {
  datosShader: DatosShader | null;
  latCentro:   number | null;
  zonas:       Zona[];
  dibujos:     ElementoDibujo[];
  /**
   * Avisa que quedó un árbol elegido esperando el clic que lo ubica. El modo del
   * mapa vive en el padre —es uno solo para toda la app— así que el hook no lo
   * prende: lo pide.
   */
  onPedirClicArbol: () => void;
}

/**
 * Mapa de sombras + insolación (Fase B del refactor de MapaTerrenoApp).
 * Dueño de todo el estado de sombras (fecha/hora/objetos), la animación del día
 * y el cálculo de horas de sol acumuladas. Lee `datosShader`/`latCentro`/geometría
 * de solo lectura; devuelve estado y setters para que el padre (handleMapClick,
 * serializador de snapshot, paneles) los use con los mismos nombres.
 * Extraído tal cual: misma lógica, mismas dependencias de efectos.
 */
export function useSombras({ datosShader, latCentro, zonas, dibujos, onPedirClicArbol }: Params) {
  const [sombrasActivo,    setSombrasActivo]     = useState(false);
  const [sombrasDoy,       setSombrasDoy]        = useState(355);
  const [sombrasHora,      setSombrasHora]       = useState(9);
  const [sombrasObjetos,   setSombrasObjetos]    = useState<ObjetoSombra[]>([]);
  const [animando,         setAnimando]          = useState(false);
  const [insolacion,       setInsolacion]        = useState<ResultadoInsolacion | null>(null);
  const [calculandoIns,    setCalculandoIns]     = useState(false);
  /** Árbol elegido en el panel, a la espera del clic que lo ubica en el mapa. */
  const objetoPendienteRef = useRef<{ id: string; nombre: string; altura_m: number; radio_m: number } | null>(null);

  // Mapa de sombras (D4): calcula sobre la grilla densa según fecha/hora.
  const sombras = useMemo(
    () => (sombrasActivo && datosShader && latCentro != null)
      ? calcularSombras(datosShader, latCentro, sombrasDoy, sombrasHora, sombrasObjetos)
      : null,
    [sombrasActivo, datosShader, latCentro, sombrasDoy, sombrasHora, sombrasObjetos],
  );

  // Animación del día: avanza la hora solar entre la salida y la puesta del sol.
  useEffect(() => {
    if (!animando || latCentro == null) return;
    const { salida, puesta } = salidaPuesta(latCentro, sombrasDoy);
    const id = setInterval(() => {
      setSombrasHora(h => {
        const sig = h + 0.25;
        return sig > puesta ? salida : sig;
      });
    }, 220);
    return () => clearInterval(id);
  }, [animando, latCentro, sombrasDoy]);

  // Al arrancar la animación, si la hora quedó fuera del día, la traemos al orto.
  const handleAnimar = useCallback(() => {
    if (latCentro == null) return;
    const { salida, puesta } = salidaPuesta(latCentro, sombrasDoy);
    setAnimando(a => {
      if (!a && (sombrasHora < salida || sombrasHora > puesta)) setSombrasHora(salida);
      return !a;
    });
  }, [latCentro, sombrasDoy, sombrasHora]);

  /**
   * Horas de sol acumuladas. Es pesado (una pasada de sombras por cada paso del
   * día), así que va bajo demanda y cede un frame antes para que el botón pueda
   * pintar su estado de "calculando".
   */
  const handleInsolacion = useCallback(async () => {
    if (!datosShader || latCentro == null) return;
    setCalculandoIns(true);
    await new Promise(r => setTimeout(r, 30));
    try {
      setInsolacion(calcularInsolacion(datosShader, latCentro, sombrasDoy, sombrasObjetos, 20));
    } finally {
      setCalculandoIns(false);
    }
  }, [datosShader, latCentro, sombrasDoy, sombrasObjetos]);

  // El mapa de insolación es de un día concreto: si cambian el día o los objetos, caduca.
  useEffect(() => { setInsolacion(null); }, [sombrasDoy, sombrasObjetos]);

  /** Polígonos ya dibujados que se pueden levantar como volumen con altura. */
  const poligonosLevantables = useMemo(() => [
    ...zonas.map(z => ({ id: z.id, nombre: z.nombre, vertices: z.vertices })),
    ...dibujos.flatMap(d => d.tipo === 'poligono'
      ? [{ id: d.id, nombre: d.nombre || 'Polígono', vertices: d.vertices }]
      : []),
  ], [zonas, dibujos]);

  const handleAlturaObjeto = useCallback((id: string, altura: number) => {
    if (!Number.isFinite(altura) || altura <= 0) return;
    setSombrasObjetos(o => o.map(x => x.id === id ? { ...x, altura_m: altura } : x));
  }, []);
  const handleEliminarObjeto = useCallback((id: string) => {
    setSombrasObjetos(o => o.filter(x => x.id !== id));
  }, []);

  const handleAgregarObjeto = useCallback((preset: typeof PRESETS_OBJETO[number], vertices?: Vertice[]) => {
    const id = crypto.randomUUID();
    if (preset.tipo === 'arbol') {
      objetoPendienteRef.current = { id, nombre: preset.etiqueta, altura_m: preset.altura_m, radio_m: preset.radio_m ?? 3 };
      onPedirClicArbol();
    } else if (vertices && vertices.length >= 3) {
      setSombrasObjetos(o => [...o, { id, tipo: 'volumen', nombre: preset.etiqueta, altura_m: preset.altura_m, vertices }]);
    }
  }, [onPedirClicArbol]);

  return {
    sombrasActivo, setSombrasActivo,
    sombrasDoy, setSombrasDoy,
    sombrasHora, setSombrasHora,
    sombrasObjetos, setSombrasObjetos,
    animando,
    insolacion, setInsolacion,
    calculandoIns,
    objetoPendienteRef,
    sombras,
    handleAnimar,
    handleInsolacion,
    poligonosLevantables,
    handleAlturaObjeto,
    handleEliminarObjeto,
    handleAgregarObjeto,
  };
}
