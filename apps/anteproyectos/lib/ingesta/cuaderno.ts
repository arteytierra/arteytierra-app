/**
 * Lectura del Cuaderno de Diseño Participativo completado por la familia.
 *
 * El cuaderno es un .docx con una estructura estable: 15 secciones numeradas
 * ("1  La familia y quiénes deciden"), preguntas con viñeta y las respuestas
 * escritas debajo. La sección 10 trae además una tabla con el programa de
 * necesidades, que es lo único que el motor puede consumir directamente.
 *
 * El resto del cuaderno se conserva como texto por sección: es el material
 * que da contexto al diseño (deseos, prioridades, historia) y que se muestra
 * al lado de las propuestas para justificarlas.
 */

export interface PreguntaRespuesta {
  pregunta: string;
  respuesta: string;
}

export interface SeccionCuaderno {
  numero: number;
  titulo: string;
  preguntas: PreguntaRespuesta[];
  /** Texto completo de la sección, por si el parseo por pregunta se queda corto. */
  textoCompleto: string;
}

export interface FilaProgramaCuaderno {
  ambiente: string;
  para_que: string;
  tamano: string;
  cerca_de: string;
}

export interface CuadernoLeido {
  secciones: SeccionCuaderno[];
  /** Filas de la tabla del punto 10, ya sin la fila de ejemplo ni las vacías. */
  programa: FilaProgramaCuaderno[];
  /** Respuestas del punto 15 — los tres deseos irrenunciables. */
  deseosIrrenunciables: string[];
}

const RE_SECCION = /^(\d{1,2})\s{1,3}(.+)$/;
const RE_VINETA = /^[•·-]\s+(.*)$/;

/**
 * Parte el texto plano del cuaderno en secciones numeradas con sus
 * pares pregunta/respuesta.
 */
export function parsearTextoCuaderno(texto: string): SeccionCuaderno[] {
  const lineas = texto.split(/\r?\n/);
  const secciones: SeccionCuaderno[] = [];
  let actual: SeccionCuaderno | null = null;
  let preguntaAbierta: PreguntaRespuesta | null = null;

  const cerrarPregunta = () => {
    if (preguntaAbierta && actual) {
      preguntaAbierta.respuesta = preguntaAbierta.respuesta.trim();
      if (preguntaAbierta.respuesta) actual.preguntas.push(preguntaAbierta);
    }
    preguntaAbierta = null;
  };

  for (const cruda of lineas) {
    const linea = cruda.trim();
    if (!linea) continue;

    const mSeccion = linea.match(RE_SECCION);
    // Una sección válida tiene número 1–15 y un título con letras (no una
    // cifra suelta de una respuesta como "4 personas").
    if (mSeccion) {
      const numero = Number(mSeccion[1]);
      const titulo = mSeccion[2]!.trim();
      const pareceTitulo = numero >= 1 && numero <= 15 && /^[A-ZÁÉÍÓÚÑ]/.test(titulo) && titulo.length > 8;
      if (pareceTitulo) {
        cerrarPregunta();
        actual = { numero, titulo, preguntas: [], textoCompleto: '' };
        secciones.push(actual);
        continue;
      }
    }

    if (!actual) continue;
    actual.textoCompleto += linea + '\n';

    const mVineta = linea.match(RE_VINETA);
    if (mVineta) {
      cerrarPregunta();
      preguntaAbierta = { pregunta: mVineta[1]!.trim(), respuesta: '' };
      continue;
    }

    if (preguntaAbierta) preguntaAbierta.respuesta += linea + ' ';
  }
  cerrarPregunta();

  for (const s of secciones) s.textoCompleto = s.textoCompleto.trim();
  return secciones;
}

const CELDAS_EJEMPLO = /^(ej:|ambiente$|¿para qué|tamaño$|¿cerca)/i;

/**
 * Extrae la tabla del programa de necesidades del HTML que produce mammoth.
 * Se usa el HTML y no el texto plano porque en texto las celdas se vuelven
 * líneas sueltas y es imposible saber dónde termina una fila.
 */
export function parsearTablaPrograma(html: string): FilaProgramaCuaderno[] {
  const filas: FilaProgramaCuaderno[] = [];
  const tablas = html.match(/<table[\s\S]*?<\/table>/gi) ?? [];

  for (const tabla of tablas) {
    const tr = tabla.match(/<tr[\s\S]*?<\/tr>/gi) ?? [];
    for (const fila of tr) {
      const celdas = (fila.match(/<t[dh][\s\S]*?<\/t[dh]>/gi) ?? []).map(c =>
        c
          .replace(/<[^>]+>/g, ' ')
          .replace(/&nbsp;/g, ' ')
          .replace(/&amp;/g, '&')
          .replace(/\s+/g, ' ')
          .trim(),
      );
      if (celdas.length < 4) continue;

      const [ambiente = '', para_que = '', tamano = '', cerca_de = ''] = celdas;
      // Descarta encabezado, fila de ejemplo y filas que quedaron en blanco.
      if (!ambiente || CELDAS_EJEMPLO.test(ambiente)) continue;
      filas.push({ ambiente, para_que, tamano, cerca_de });
    }
  }
  return filas;
}

/** Toma las respuestas del punto 15 como lista de deseos. */
function extraerDeseos(secciones: SeccionCuaderno[]): string[] {
  const s15 = secciones.find(s => s.numero === 15);
  if (!s15) return [];
  return s15.textoCompleto
    .split(/\n/)
    .map(l => l.replace(/^[\d.\-•·)\s]+/, '').trim())
    .filter(l => l.length > 3 && !/^Para cerrar/i.test(l) && !/deseos/i.test(l))
    .slice(0, 3);
}

export function leerCuaderno(textoPlano: string, html: string): CuadernoLeido {
  const secciones = parsearTextoCuaderno(textoPlano);
  return {
    secciones,
    programa: parsearTablaPrograma(html),
    deseosIrrenunciables: extraerDeseos(secciones),
  };
}
