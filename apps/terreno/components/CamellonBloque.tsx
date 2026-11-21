'use client';

import { useCallback, useMemo, useState } from 'react';
import { Loader2, Info, TriangleAlert, Check, Rows3 } from 'lucide-react';
import * as turf from '@turf/turf';
import { recortarGrillaA, type GrillaElevacion } from '@/lib/grillaElevacion';
import { pendienteMediaPct } from '@/lib/swales';
import { areaPoligonoM2 } from '@/lib/dibujos';
import {
  trazarCamellon, resumenCamellon, PASO_BBF_M,
  type EntradaCamellon, type ResultadoCamellon, type CamellonResumen, type SalidaResumen,
} from '@/lib/camellon';
import type { PoligonoCutFill } from './CutFillPanel';
import type { GrupoHidro } from '@/lib/cuenca';
import type { ClaseUSDA } from '@/lib/textura';
import type { FlujoLaminar } from '@/lib/biomaTipos';
import { avisoFlujoLaminar } from '@/lib/saludCalculo';
import { AvisoSueloObra } from './AvisoSueloObra';

/**
 * El camellón ancho con surco a pendiente, dentro del panel de líneas clave.
 *
 * Va acá y no en una pestaña propia porque **es la variante para suelo
 * expansivo del mismo problema**: el patrón de cultivo mueve el agua con la
 * deriva de un surco, y en un vertisol ese mismo surco tiene que correr entre
 * el 0,4 y el 0,8 % —no al 0,2 % del estándar— y terminar en un desagüe. Es la
 * misma geometría con otra banda y con salida obligatoria.
 *
 * Lo que hace el bloque y lo que NO hace: pide el relieve, recorta a la
 * parcela, mide su pendiente media y llama al motor. No elige la parcela (la
 * elige el patrón, arriba) ni dibuja nada solo: el trazo va al plano cuando el
 * usuario lo aplica, como el patrón.
 *
 * Quién lee el resultado: `onResumen` lo sube al mapa, que lo guarda en el
 * proyecto y lo manda al informe; de ahí lo lee la lista de materiales
 * (`renglonesDeCamellon`). Por eso el resumen se emite incluso cuando el
 * camellón no sale: un sistema sin salida dimensionada tiene que llegar igual
 * a la lista, declarando lo que falta.
 */
interface Props {
  parcelas:         PoligonoCutFill[];
  parcelaId:        string;
  obtenerGrilla:    () => Promise<GrillaElevacion | null>;
  grupoHidro:       GrupoHidro | null;
  lluvia10a24h_mm:  number | null;
  textura:          ClaseUSDA | null;
  /** true cuando el diagnóstico de suelo expansivo dio positivo; `null` = sin dato. */
  sueloExpansivo:   boolean | null;
  /**
   * El paisaje donde interceptar el escurrimiento laminar es el error, si la
   * ficha de la ecorregión lo declara. Se lee ANTES de dibujar: no cambia
   * ningún número de la obra, cambia si la obra corresponde.
   */
  flujoLaminar?: FlujoLaminar | null;
  onResumen?:       (r: CamellonResumen | null) => void;
  onAplicar?:       (r: ResultadoCamellon) => void;
}

const coma = (n: number) => String(Math.round(n * 100) / 100).replace('.', ',');

function Dato({ rotulo, valor }: { rotulo: string; valor: string }) {
  return (
    <div className="bg-bone-50 rounded px-2 py-1">
      <span className="text-ink-700/50">{rotulo}</span><br />
      <span className="font-mono font-bold text-ink-900">{valor}</span>
    </div>
  );
}

function SalidaBloque({ s }: { s: SalidaResumen }) {
  const nombre = s.cual === 'desague' ? 'Desagüe de parcela' : 'Cauce empastado de salida';
  return (
    <div className="border border-bone-200 rounded-lg p-2 space-y-1.5">
      <p className="text-[11px] font-semibold text-ink-900">{nombre}</p>
      <div className="grid grid-cols-3 gap-1.5 text-[10px]">
        <Dato rotulo="Ancho" valor={`${coma(s.anchoTotal_m)} m`} />
        <Dato rotulo="Profundidad" valor={`${coma(s.profundidadTotal_m)} m`} />
        <Dato rotulo="Pico" valor={`${coma(s.caudal_m3s)} m³/s`} />
        <Dato rotulo="Largo" valor={`${coma(s.largo_m)} m`} />
        <Dato rotulo="Velocidad" valor={`${coma(s.velocidad_ms)} m/s`} />
        <Dato rotulo="Excavación" valor={`${s.excavacion_m3.toLocaleString('es-AR')} m³`} />
      </div>
      <p className="text-[9px] text-ink-700/55 leading-relaxed">
        Para {coma(s.area_ha)} ha de aporte con CN {s.cn} y la tormenta de 10 años y 24 h
        ({coma(s.lluvia_mm)} mm). Esfuerzo sobre el suelo {coma(s.esfuerzoEfectivo_pa)} Pa de{' '}
        {coma(s.esfuerzoAdmisible_pa)} Pa admisibles. Talud de orilla {coma(s.taludOrilla)}:1.
      </p>
      {!s.sueloAguanta && (
        <p className="text-[9px] text-clay-700/90 leading-relaxed flex gap-1">
          <TriangleAlert className="w-2.5 h-2.5 mt-[2px] shrink-0" />
          <span>
            Ni el cauce más ancho que admite el método baja el esfuerzo del admisible: acá un cauce
            empastado no alcanza y hace falta revestimiento o estructuras de caída.
          </span>
        </p>
      )}
      {!s.pastoAguanta && (
        <p className="text-[9px] text-clay-700/90 leading-relaxed flex gap-1">
          <TriangleAlert className="w-2.5 h-2.5 mt-[2px] shrink-0" />
          <span>El esfuerzo pasa de lo que aguanta el pasto antes que de lo que aguanta el suelo.</span>
        </p>
      )}
    </div>
  );
}

export function CamellonBloque({
  parcelas, parcelaId, obtenerGrilla, grupoHidro, lluvia10a24h_mm, textura,
  sueloExpansivo, flujoLaminar = null, onResumen, onAplicar,
}: Props) {
  const [cargando, setCargando] = useState(false);
  const [error,    setError]    = useState<string | null>(null);
  const [res,      setRes]      = useState<ResultadoCamellon | null>(null);
  const [resumen,  setResumen]  = useState<CamellonResumen | null>(null);
  const [aplicado, setAplicado] = useState(false);

  /**
   * El camellón también concentra la lámina: es un surco a pendiente que junta
   * el agua de una faja y la lleva a un cauce. En el paisaje que el aviso
   * describe eso es el mecanismo del daño, no su remedio.
   */
  const avisoLamina = useMemo(
    () => avisoFlujoLaminar({ flujoLaminar, obra: 'camellon' }),
    [flujoLaminar],
  );

  const trazar = useCallback(async () => {
    const parcela = parcelas.find(p => p.id === parcelaId);
    if (!parcela) { setError('Elegí la parcela arriba.'); return; }
    setCargando(true); setError(null); setRes(null); setResumen(null); setAplicado(false);
    try {
      const g = await obtenerGrilla();
      if (!g) { setError('No se pudo obtener la elevación del terreno.'); return; }
      const recorte = recortarGrillaA(g, parcela.vertices);
      if (!recorte) { setError('La parcela es más chica que el paso del modelo de elevación.'); return; }

      // El `dentro` es el polígono real, no la ventana: el recorte devuelve el
      // rectángulo envolvente con las cotas intactas, así que sin esto el
      // trazado se escaparía de la parcela por las esquinas.
      const anillo = parcela.vertices.map(v => [v.lng, v.lat] as [number, number]);
      anillo.push(anillo[0]!);
      const poly = turf.polygon([anillo]);
      const dentro = (lat: number, lng: number) =>
        turf.booleanPointInPolygon(turf.point([lng, lat]), poly);

      const entrada: EntradaCamellon = {
        pendienteTerreno_pct: pendienteMediaPct(recorte, parcela.vertices),
        grupoHidro,
        lluvia10a24h_mm,
        textura,
        sueloExpansivo: sueloExpansivo ?? undefined,
        superficie_ha: areaPoligonoM2(parcela.vertices) / 10_000,
        paso_m: PASO_BBF_M,
      };
      const r = trazarCamellon(recorte, entrada, dentro);
      const rr = resumenCamellon(entrada, r);
      setRes(r); setResumen(rr); onResumen?.(rr);
    } catch {
      setError('Error al trazar el camellón.');
    } finally {
      setCargando(false);
    }
  }, [parcelas, parcelaId, obtenerGrilla, grupoHidro, lluvia10a24h_mm, textura, sueloExpansivo, onResumen]);

  return (
    <div className="border-t border-bone-200 pt-4">
      <p className="text-xs font-semibold text-ink-700 uppercase tracking-wide mb-1">
        Camellón ancho con surco a pendiente
      </p>
      <p className="text-[10px] text-ink-700/55 mb-2 leading-relaxed">
        La variante para <b>suelo expansivo</b>: camellones de un metro separados cada{' '}
        {coma(PASO_BBF_M)} m, con el surco corriendo entre el 0,4 y el 0,8 % hasta un desagüe de
        parcela y un cauce de salida. En un vertisol el problema no es retener agua, es sacarla sin
        romper nada, y un surco al 0,2 % no drena: encharca.
      </p>
      {avisoLamina && <div className="mb-2"><AvisoSueloObra aviso={avisoLamina} /></div>}
      <button
        onClick={trazar}
        disabled={cargando || !parcelaId}
        className="w-full flex items-center justify-center gap-1.5 py-2 bg-moss-700 hover:bg-moss-900 disabled:opacity-40 text-bone-50 rounded-xl text-xs font-medium transition-colors"
      >
        {cargando ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Rows3 className="w-3.5 h-3.5" />}
        {cargando ? 'Trazando…' : 'Trazar el camellón y sus salidas'}
      </button>
      {!parcelaId && <p className="text-[10px] text-ink-700/40 text-center mt-1">Elegí la parcela arriba.</p>}
      {error && <p className="text-[10px] text-clay-600 mt-2 leading-tight">{error}</p>}

      {resumen && (
        <div className="mt-3 space-y-2 bg-white rounded-xl border border-bone-200 p-3">
          <div className="grid grid-cols-3 gap-1.5 text-[10px]">
            <Dato rotulo="Grado del surco" valor={resumen.grado_pct != null ? `${coma(resumen.grado_pct)} %` : '—'} />
            <Dato rotulo="Pend. terreno" valor={`${coma(resumen.pendienteTerreno_pct)} %`} />
            <Dato rotulo="Superficie" valor={resumen.superficie_ha != null ? `${coma(resumen.superficie_ha)} ha` : '—'} />
            <Dato rotulo="Unidad de drenaje" valor={resumen.anchoUnidad_m != null ? `${coma(resumen.anchoUnidad_m)} m` : '—'} />
            <Dato rotulo="Surco" valor={resumen.surco_m != null ? `${resumen.surco_m.toLocaleString('es-AR')} m` : '—'} />
            <Dato
              rotulo="Yunta"
              valor={resumen.jornadasYunta
                ? `${coma(resumen.jornadasYunta.min)}–${coma(resumen.jornadasYunta.max)} j`
                : '—'}
            />
          </div>
          <p className="text-[9px] text-ink-700/55 leading-relaxed border-t border-bone-200 pt-2">
            {resumen.banda.nota}
          </p>

          {resumen.salidaDesague && <SalidaBloque s={resumen.salidaDesague} />}
          {resumen.salidaCauce && <SalidaBloque s={resumen.salidaCauce} />}

          {resumen.avisos.map(a => (
            <p
              key={a.id}
              className={`text-[9px] leading-relaxed flex gap-1 ${
                a.nivel === 'alerta' ? 'text-clay-700/90' : a.nivel === 'ok' ? 'text-moss-800/90' : 'text-ink-700/65'
              }`}
            >
              {a.nivel === 'alerta'
                ? <TriangleAlert className="w-2.5 h-2.5 mt-[2px] shrink-0" />
                : a.nivel === 'ok'
                  ? <Check className="w-2.5 h-2.5 mt-[2px] shrink-0" />
                  : <Info className="w-2.5 h-2.5 mt-[2px] shrink-0" />}
              <span><b>{a.titulo}.</b> {a.detalle}</span>
            </p>
          ))}

          {res?.trazable && onAplicar && (
            <button
              onClick={() => { onAplicar(res); setAplicado(true); }}
              disabled={aplicado}
              className={`w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-[11px] font-semibold transition-colors ${
                aplicado ? 'bg-moss-100 text-moss-700' : 'bg-ink-900 hover:bg-ink-700 text-bone-50'
              }`}
            >
              {aplicado ? 'Trazo aplicado al plano ✓' : 'Aplicar la guía, el desagüe y el cauce al plano'}
            </button>
          )}
          <p className="text-[9px] text-ink-700/45 leading-relaxed">
            Las tres líneas van como caminos a su propia capa para poder medirlas y exportarlas. Los
            camellones en sí no se dibujan uno por uno: son las paralelas a la guía cada{' '}
            {coma(resumen.paso_m)} m, y a campo las traza la máquina copiando la guía.
          </p>
        </div>
      )}
    </div>
  );
}
