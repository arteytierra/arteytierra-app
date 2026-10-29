/**
 * ENCARGO 04 · C — «Lo que te llevás»: el informe. Diez segundos, una pasada.
 *
 * Una panorámica vertical lenta sobre el entregable: la portada con el
 * perímetro del predio, el índice, la página de números donde cada fila lleva
 * su procedencia, su fecha y su resolución, el anexo de fuentes y el párrafo de
 * límites del final.
 *
 * ── Por qué esto es una RECOMPOSICIÓN y no el informe mismo ───────────────
 *
 * `informe.ts` son tipos y dos helpers de localStorage: el informe lo arma
 * `InformeView.tsx`, 2.049 líneas de React de cliente con alias `@/`, íconos y
 * hooks que salen a la red. Montar eso adentro de Remotion arrastraría medio
 * Next adentro del renderizador. Y capturarlo de pantalla está prohibido dos
 * veces: `/informe/*` está detrás del login, y el contrato dice que no se
 * graban pantallas porque se traban y pixelan.
 *
 * Lo que se conserva es lo que hace que la pieza sea verdadera: los números
 * salen de los mismos motores sobre el mismo predio —los escribe
 * `datos-informe.ts`—, los títulos del índice son los de `TITULOS` en la vista,
 * el anexo es el Anexo A, y el párrafo del final está copiado palabra por
 * palabra.
 *
 * ── La restricción que tiene esta pieza y ninguna otra ────────────────────
 *
 * La landing no nombra proveedores de datos. En el informe de verdad están con
 * nombre completo, y ahí corresponde. Acá cada fila conserva su procedencia
 * —esa columna es justamente lo que la pieza tiene que mostrar— pero el nombre
 * del proveedor se reemplaza por la forma genérica que ya usa la página:
 * «modelo de elevación global · 30 m». El JSON guarda al lado el nombre real de
 * cada fuente, para que se pueda comprobar que la forma genérica no cambió
 * ningún dato.
 *
 * ── Y por qué no hay bucle ────────────────────────────────────────────────
 *
 * Porque es una lectura de arriba abajo: termina en el párrafo de límites, que
 * es donde tiene que terminar. El encargo lo pide así —«corre una vez al entrar
 * en vista»— y por eso el primer y el último cuadro no se parecen en nada.
 */
import { AbsoluteFill, Easing, interpolate, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';

import { COLORES, LOGOS } from '../marca';
import { DISPLAY, SANS } from '../tipografia';
import { INFORME, LIENZO_PLANO, PLANO } from './informe/datos';

/** Diez segundos a 30 fps. */
export const CUADROS_INFORME = 300;

/** El papel y la tinta del informe, derivados de los tokens de marca. */
const PAPEL = '#FBF8F3';
const LINEA = '#E4DCCE';
const TINTA = COLORES.tinta;
const TENUE = '#6B5F57';
const ACENTO = COLORES.agua;

const PAD = 86;

export const Informe: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();

  // El alto del documento se mide en el propio layout: la panorámica tiene que
  // terminar en el último renglón del párrafo de límites, y un alto escrito a
  // mano se desfasa el día que una fila cambia de texto.
  const altoDoc = altoDelDocumento(INFORME.filas.length, INFORME.indice.length, INFORME.anexo.length);
  const recorrido = Math.max(0, altoDoc - height);

  // Lenta y pareja, con una entrada y una salida suaves: el ojo tiene que poder
  // leer una fila al pasar, y un arranque de golpe hace que las primeras dos se
  // pierdan.
  const y = interpolate(frame, [0, CUADROS_INFORME - 1], [0, recorrido], {
    easing: Easing.bezier(0.4, 0, 0.35, 1),
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill style={{ backgroundColor: PAPEL, fontFamily: SANS }}>
      <div style={{ position: 'absolute', top: -y, left: 0, width, height: altoDoc }}>
        <Portada ancho={width} alto={height} />
        <Contenido ancho={width} />
        <Numeros ancho={width} />
        <Anexo ancho={width} />
      </div>
    </AbsoluteFill>
  );
};

// ─── El alto, en un solo lugar ──────────────────────────────────────────────
//
// Cada bloque lleva su alto EXPLÍCITO y la panorámica se calcula con los mismos
// números. Es lo contrario de lo que parece más simple —dejar que el documento
// fluya y estimar su alto— y la razón es que la estimación se equivoca: la
// primera versión sobraba por casi trescientos píxeles y el final de la
// panorámica se iba a papel en blanco. Con el alto declarado, el layout y la
// cuenta no se pueden desfasar.

const ALTO_FILA = 38;
const ALTO_IDX = 30;
const ALTO_ANEXO = 58;
/** Rótulo de sección: el renglón del título más su línea y su aire. */
const ALTO_TITULO = 76;

const altoPortada = 720;
const altoContenido = (indice: number) => 54 + indice * ALTO_IDX + 46;
const altoNumeros = (filas: number) => ALTO_TITULO + 26 + filas * ALTO_FILA + 46;
/** El anexo cierra con el párrafo de límites y un respiro de pie de página. */
const altoAnexo = (anexo: number) => ALTO_TITULO + anexo * ALTO_ANEXO + 104;

function altoDelDocumento(filas: number, indice: number, anexo: number) {
  return altoPortada + altoContenido(indice) + altoNumeros(filas) + altoAnexo(anexo);
}

// ─── Piezas del documento ───────────────────────────────────────────────────

/** El rótulo de sección del informe: el número en una cajita y el título. */
const Titulo: React.FC<{ numero: string; texto: string }> = ({ numero, texto }) => (
  <div style={{
    display: 'flex', alignItems: 'baseline', gap: 10,
    borderBottom: `1px solid ${LINEA}`, paddingBottom: 10, marginBottom: 20,
  }}>
    <span style={{
      fontSize: 15, fontWeight: 700, color: '#2F5A3A', backgroundColor: '#E6EFE4',
      borderRadius: 4, padding: '3px 8px',
    }}>{numero}</span>
    <h2 style={{
      margin: 0, fontSize: 21, fontWeight: 600, color: TINTA,
      textTransform: 'uppercase', letterSpacing: 1.1,
    }}>{texto}</h2>
  </div>
);

const Portada: React.FC<{ ancho: number; alto: number }> = ({ ancho, alto }) => (
  <div style={{ height: 720, padding: PAD, boxSizing: 'border-box', position: 'relative' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <p style={{
        margin: 0, fontSize: 13, letterSpacing: 2.4, textTransform: 'uppercase',
        color: TENUE, fontWeight: 600,
      }}>Arte y Tierra</p>
      <p style={{ margin: 0, fontSize: 14, color: TENUE }}>{INFORME.fecha_larga}</p>
    </div>

    {/* El lockup va RASTERIZADO: el wordmark está dibujado con una tipografía
        que no está en el renderizador, y un fallback tipográfico en la portada
        del entregable no se descubre hasta que el video está publicado. */}
    <img src={staticFile(LOGOS.negro)} alt="acequia" style={{ height: 38, marginTop: 40 }} />

    <h1 style={{
      margin: '10px 0 0', fontFamily: DISPLAY, fontSize: 44, fontWeight: 400,
      color: TINTA, lineHeight: 1.1,
    }}>{INFORME.titulo}</h1>

    {/* El perímetro del predio, dibujado con sus siete mojones. Es el mismo
        polígono de todas las piezas: el plano del informe, sin la ortofoto. */}
    <div style={{ marginTop: 30, display: 'flex', gap: 40, alignItems: 'center' }}>
      <svg width={LIENZO_PLANO.w} height={LIENZO_PLANO.h}
        viewBox={`0 0 ${LIENZO_PLANO.w} ${LIENZO_PLANO.h}`}>
        <polygon
          points={PLANO.puntos.map(p => p.join(',')).join(' ')}
          fill="rgba(46,107,138,0.07)" stroke={ACENTO} strokeWidth={2.2} strokeLinejoin="round"
        />
        {PLANO.puntos.map(([x, yy], i) => (
          <circle key={i} cx={x} cy={yy} r={4} fill={PAPEL} stroke={ACENTO} strokeWidth={2} />
        ))}
      </svg>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, flex: 1 }}>
        <Stat label="Superficie" valor={`${INFORME.metricas.area_ha_txt} ha`}
          sub={`${INFORME.metricas.area_m2_txt} m²`} />
        <Stat label="Perímetro" valor={`${INFORME.metricas.perimetro_txt} m`}
          sub={`${INFORME.metricas.mojones} mojones`} />
        {INFORME.koppen && (
          <Stat label="Clima" valor={INFORME.koppen.codigo} sub={INFORME.koppen.descripcion} />
        )}
      </div>
    </div>

    <p style={{
      position: 'absolute', left: PAD, right: PAD, bottom: 34,
      margin: 0, fontSize: 12.5, color: TENUE, lineHeight: 1.6,
      borderTop: `1px solid ${LINEA}`, paddingTop: 16,
    }}>
      Análisis orientativo a partir de imágenes satelitales y modelos públicos.
      Verificar en campo antes de ejecutar obras.
    </p>
    <div style={{ display: 'none' }}>{ancho}{alto}</div>
  </div>
);

const Stat: React.FC<{ label: string; valor: string; sub: string }> = ({ label, valor, sub }) => (
  <div style={{
    border: `1px solid ${LINEA}`, backgroundColor: '#F6F1E7', borderRadius: 9,
    padding: '10px 14px',
  }}>
    <p style={{ margin: 0, fontSize: 12.5, color: TENUE }}>{label}</p>
    <p style={{ margin: '2px 0 0', fontSize: 19, fontWeight: 700, color: TINTA }}>{valor}</p>
    <p style={{ margin: '2px 0 0', fontSize: 12, color: '#8C8178' }}>{sub}</p>
  </div>
);

const Contenido: React.FC<{ ancho: number }> = () => (
  <div style={{
    padding: `0 ${PAD}px`, height: altoContenido(INFORME.indice.length), boxSizing: 'border-box',
  }}>
    <p style={{
      margin: '0 0 14px', fontSize: 13, letterSpacing: 2.4, textTransform: 'uppercase',
      color: TENUE, fontWeight: 600, height: 40,
    }}>Contenido</p>
    <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
      {INFORME.indice.map(i => (
        <li key={i.n} style={{
          height: ALTO_IDX, display: 'flex', alignItems: 'baseline', gap: 12,
          fontSize: 17, color: TINTA,
        }}>
          <span style={{ width: 24, color: TENUE }}>{i.n}</span>
          <span>{i.titulo}</span>
        </li>
      ))}
    </ul>
  </div>
);

/**
 * La página de números. Cada fila lleva su valor, su procedencia, su fecha y su
 * resolución, y ésa es toda la pieza: la columna de procedencia es lo que
 * separa un informe de un PDF bonito.
 */
const Numeros: React.FC<{ ancho: number }> = () => {
  // Los anchos salen de lo que hay que leer, no de un reparto parejo: la
  // procedencia es el tema de la pieza y necesita entrar entera —«mapa global
  // de suelos» cortado en «mapa global de suel…» no muestra ninguna
  // procedencia—, y el dato y el valor se leen de un vistazo.
  const COLS = ['26%', '24%', '26%', '12%', '12%'];
  const CABEZA = ['Dato', 'Valor', 'Procedencia', 'Período', 'Resolución'];
  return (
    <div style={{
      padding: `0 ${PAD}px`, height: altoNumeros(INFORME.filas.length), boxSizing: 'border-box',
    }}>
      <Titulo numero="1" texto="Datos del terreno" />
      <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
        <colgroup>{COLS.map((w, i) => <col key={i} style={{ width: w }} />)}</colgroup>
        <thead>
          <tr>
            {CABEZA.map(h => (
              <th key={h} style={{
                textAlign: 'left', fontSize: 12.5, fontWeight: 600, color: TENUE,
                padding: '0 10px 10px 0', borderBottom: `1px solid ${LINEA}`,
              }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {INFORME.filas.map((f, i) => (
            <tr key={f.dato} style={{ backgroundColor: i % 2 ? '#F6F1E7' : 'transparent' }}>
              <td style={celda(15, TINTA)}>{f.dato}</td>
              <td style={{ ...celda(15, TINTA), fontWeight: 600 }}>{f.valor}</td>
              <td style={celda(12.5, TENUE)}>{f.fuente}</td>
              <td style={celda(12.5, TENUE)}>{f.fecha}</td>
              <td style={celda(12.5, TENUE)}>{f.resolucion}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const celda = (fontSize: number, color: string): React.CSSProperties => ({
  fontSize, color, padding: '0 10px 0 0', height: ALTO_FILA,
  overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis',
});

const Anexo: React.FC<{ ancho: number }> = () => (
  <div style={{
    padding: `0 ${PAD}px`, height: altoAnexo(INFORME.anexo.length), boxSizing: 'border-box',
  }}>
    <Titulo numero="A" texto="Anexo — fuentes y metodología" />
    <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
      {INFORME.anexo.map(a => (
        <li key={a.rubro} style={{
          minHeight: ALTO_ANEXO, fontSize: 14.5, color: TENUE, lineHeight: 1.55,
          borderLeft: `2px solid ${LINEA}`, paddingLeft: 14, marginBottom: 2,
        }}>
          <span style={{ fontWeight: 600, color: TINTA }}>{a.rubro}: </span>{a.texto}
        </li>
      ))}
    </ul>
    <p style={{
      marginTop: 26, fontSize: 14.5, color: TENUE, lineHeight: 1.65,
      borderTop: `1px solid ${LINEA}`, paddingTop: 18,
    }}>{INFORME.limites}</p>
  </div>
);
