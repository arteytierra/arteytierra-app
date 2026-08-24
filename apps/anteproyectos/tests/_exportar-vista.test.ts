/**
 * No es un test: es un generador de vista previa que se ejecuta con vitest
 * para aprovechar la resolución de alias del proyecto. Escribe un HTML con
 * los tres anteproyectos del caso piloto para revisarlos a ojo.
 * Correr con: npx vitest run tests/_exportar-vista.test.ts
 */
import { writeFileSync } from 'node:fs';
import { it } from 'vitest';
import type { DatosClima } from '@/lib/clima';
import { generarAnteproyecto } from '@/lib/motor/generador';
import { renderFachada, renderPlanta, renderTechos } from '@/lib/motor/svg';
import { renderVista3D, VISTAS_3D } from '@/lib/motor/volumen';
import { PARAMETROS_TRANSVERSALES_DEFAULT, type AmbienteDeseado, type PerfilId } from '@/lib/tipos';

const SALIDA = process.env.SALIDA_VISTA ?? 'vista-anteproyectos.html';

const PROGRAMA: AmbienteDeseado[] = [
  { id: 'estar', tipo: 'estar-cocina-comedor', cantidad: 1, tamano: 'grande', adyacenciasDeseadas: [] },
  { id: 'd1', tipo: 'dormitorio', nombre: 'Dormitorio principal', cantidad: 1, tamano: 'grande', adyacenciasDeseadas: ['bano1'] },
  { id: 'd2', tipo: 'dormitorio', cantidad: 2, tamano: 'mediano', adyacenciasDeseadas: [] },
  { id: 'bano1', tipo: 'bano', cantidad: 1, tamano: 'mediano', adyacenciasDeseadas: ['estar'] },
  { id: 'hall', tipo: 'hall', cantidad: 1, tamano: 'chico', adyacenciasDeseadas: ['estar'] },
];

/** Clima de Aguas Buenas (PR) resumido: sólo lo que el motor consulta. */
const CLIMA = {
  lat: 18.2537,
  lng: -66.1057,
  precip_anual_mm: 1879,
  etp_anual_mm: 1400,
  tmean_anual_c: 24.5,
  viento_dir_ppal: 'E',
  meses: [],
  fuente: 'NASA POWER',
  weather_spark_url: '',
  koppen: { codigo: 'Aw', grupo: 'Tropical', descripcion: 'Sabana tropical (invierno seco)' },
} as unknown as DatosClima;

it('exporta la vista previa de los anteproyectos', () => {
  const perfiles: PerfilId[] = ['fiel-cliente', 'organico', 'bioclimatico'];
  const bloques = perfiles
    .map(p => {
      const ap = generarAnteproyecto(p, { m2CubiertosObjetivo: 90, ambientes: PROGRAMA }, PARAMETROS_TRANSVERSALES_DEFAULT, CLIMA, {
        zonaSismica: true,
      });
      const figuras = [
        ['Planta con amoblamiento', renderPlanta(ap)],
        ['Planta de techos', renderTechos(ap)],
        [`Fachada ${ap.fachadaPrincipal}`, renderFachada(ap, ap.fachadaPrincipal as 'N' | 'S' | 'E' | 'O')],
      ]
        .map(([cap, svg]) => `<figure><figcaption>${cap}</figcaption>${svg}</figure>`)
        .join('');
      const vistas3d = VISTAS_3D.map(
        v => `<figure class="v3"><figcaption>${v.nombre}</figcaption>${renderVista3D(ap, v)}</figure>`,
      ).join('');
      return `<section>
        <h2>${ap.titulo}</h2>
        <p class="meta">${ap.ancho_m.toFixed(1)} × ${ap.profundo_m.toFixed(1)} m · ${ap.area_total_m2} m² · alero ${ap.alero_m.toFixed(2)} m · h. muro ${ap.altura_muro_m.toFixed(2)} m · h. total ${ap.altura_total_m.toFixed(2)} m · cumbrera ${ap.ejeCumbrera} · fachada ${ap.fachadaPrincipal} · muro ${ap.tecnicaMuro} ${(ap.espesorMuro_m * 100).toFixed(0)} cm</p>
        ${ap.advertencias.length ? `<ul class="warn">${ap.advertencias.map(a => `<li>${a}</li>`).join('')}</ul>` : ''}
        <ul class="notas">${ap.fundamento.map(f => `<li>${f}</li>`).join('')}</ul>
        ${figuras}
        <h3>Vistas 3D</h3>
        <div class="grid3d">${vistas3d}</div>
      </section>`;
    })
    .join('');

  const html = `<!doctype html><meta charset="utf-8">
<title>Anteproyectos — José R. y Mdelmar, Aguas Buenas (PR)</title>
<style>
  body{font-family:system-ui,sans-serif;background:#FBF8F3;color:#0F1410;max-width:1100px;margin:0 auto;padding:2rem;line-height:1.5}
  h1{font-size:1.6rem} h2{font-size:1.2rem;margin-top:0}
  section{border:1px solid #E8E1D2;border-radius:10px;padding:1rem;margin-bottom:1.5rem;background:#fff}
  .meta{color:#3A5A40;font-size:.9rem}
  .warn{background:#FAF1E1;border:1px solid #E8C078;border-radius:6px;padding:.6rem 1.2rem;font-size:.88rem}
  .notas{font-size:.88rem;color:#2A352C}
  figure{margin:1rem 0} figcaption{font-size:.75rem;text-transform:uppercase;letter-spacing:.05em;color:#3A5A40;margin-bottom:.3rem}
  svg{max-width:100%;height:auto;border:1px solid #E8E1D2;border-radius:6px;background:#FBF8F3}
  h3{font-size:1rem;margin:1.5rem 0 .5rem}
  .grid3d{display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:.75rem}
  .grid3d figure{margin:0}
</style>
<h1>Anteproyectos — José R. y Mdelmar · Aguas Buenas, Puerto Rico</h1>
<p class="meta">Köppen Aw (sabana tropical) · zona sísmica · generado por el motor paramétrico de <strong>apps/anteproyectos</strong>. Esquema de anteproyecto: verificar en proyecto ejecutivo.</p>
${bloques}`;

  writeFileSync(SALIDA, html);
});
