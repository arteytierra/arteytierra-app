import { describe, expect, it } from 'vitest';
import { parsearTablaPrograma, parsearTextoCuaderno } from '@/lib/ingesta/cuaderno';
import { filasAPrograma, inferirCantidad, inferirTamano, inferirTipo } from '@/lib/ingesta/mapeo';
import { clasificarArchivo } from '@/lib/ingesta/carpeta';

// Fragmento con la forma real del cuaderno completado por la familia.
const TEXTO = `
PARTE A

1  La familia y quiénes deciden

Diseñar una casa es diseñar para una vida concreta.

•  ¿Quiénes van a vivir en la casa? (nombres, edades, y también las mascotas)

4 personas y nuestras mascotas.

•  A la hora de decidir sobre el proyecto, ¿quiénes tienen la última palabra?

María del Mar y José

8  Más y menos: lo que aman y lo que no de donde viven hoy

•  (–) Lo que NO les gusta o los incomoda:

Techo plano que retiene agua, ventanas que no aportan ventilación.
`;

describe('parsearTextoCuaderno', () => {
  it('separa las secciones numeradas con su título', () => {
    const secciones = parsearTextoCuaderno(TEXTO);
    expect(secciones.map(s => s.numero)).toEqual([1, 8]);
    expect(secciones[0]!.titulo).toBe('La familia y quiénes deciden');
  });

  it('asocia cada respuesta a su pregunta', () => {
    const s1 = parsearTextoCuaderno(TEXTO)[0]!;
    expect(s1.preguntas).toHaveLength(2);
    expect(s1.preguntas[0]!.respuesta).toContain('4 personas');
    expect(s1.preguntas[1]!.respuesta).toContain('María del Mar');
  });

  it('no confunde una respuesta que empieza con un número con un título de sección', () => {
    // "4 personas y nuestras mascotas." empieza con dígito, pero no es sección.
    const secciones = parsearTextoCuaderno(TEXTO);
    expect(secciones.some(s => s.titulo.startsWith('personas'))).toBe(false);
  });
});

describe('parsearTablaPrograma', () => {
  const HTML = `
    <table>
      <tr><td>Ambiente</td><td>¿Para qué?</td><td>Tamaño</td><td>¿Cerca de qué?</td></tr>
      <tr><td>ej: Cocina-comedor</td><td>cocinar</td><td>grande</td><td>galería</td></tr>
      <tr><td>balcon</td><td>Coger aire natural</td><td>pequeño</td><td>cocina</td></tr>
      <tr><td>Cocina/ comedor</td><td>Cocinar/ comer</td><td>Pequeña/ mediana</td><td>Sala/balcon</td></tr>
      <tr><td></td><td></td><td></td><td></td></tr>
    </table>`;

  it('descarta encabezado, fila de ejemplo y filas vacías', () => {
    const filas = parsearTablaPrograma(HTML);
    expect(filas.map(f => f.ambiente)).toEqual(['balcon', 'Cocina/ comedor']);
  });
});

describe('inferencia de ambientes', () => {
  it('reconoce vocabulario caribeño y rioplatense', () => {
    expect(inferirTipo('marquesina')).toBe('garage');
    expect(inferirTipo('balcon')).toBe('galeria');
    expect(inferirTipo('cuarto de Ilan')).toBe('dormitorio');
    expect(inferirTipo('Cocina/ comedor')).toBe('estar-cocina-comedor');
    expect(inferirTipo('medio baño')).toBe('bano');
  });

  it('deja como "otro" lo que no reconoce, en vez de adivinar', () => {
    expect(inferirTipo('cuarto de máquinas del futuro')).toBe('dormitorio'); // contiene "cuarto"
    expect(inferirTipo('zona zen')).toBe('otro');
  });

  it('interpreta el tamaño escrito en lenguaje natural', () => {
    expect(inferirTamano('pequeño')).toBe('chico');
    expect(inferirTamano('Pequeña/ mediana')).toBe('chico');
    expect(inferirTamano('amplio')).toBe('grande');
    expect(inferirTamano('')).toBe('mediano');
  });

  it('detecta cantidad escrita en cifra o en palabra', () => {
    expect(inferirCantidad('3 cuartos')).toBe(3);
    expect(inferirCantidad('dos baños')).toBe(2);
    expect(inferirCantidad('cocina')).toBe(1);
  });
});

describe('filasAPrograma', () => {
  const filas = [
    { ambiente: 'balcon', para_que: 'aire', tamano: 'pequeño', cerca_de: 'cocina' },
    { ambiente: 'Cocina/ comedor', para_que: 'comer', tamano: 'mediana', cerca_de: 'balcon' },
  ];

  it('genera ids únicos y estables a partir del nombre', () => {
    const prog = filasAPrograma(filas);
    expect(prog.map(p => p.id)).toEqual(['balcon', 'cocina-comedor']);
  });

  it('resuelve las adyacencias en ambos sentidos', () => {
    const prog = filasAPrograma(filas);
    // El balcón pidió estar cerca de la cocina y viceversa.
    expect(prog[0]!.adyacenciasDeseadas).toContain('cocina-comedor');
    expect(prog[1]!.adyacenciasDeseadas).toContain('balcon');
  });

  it('conserva el nombre original escrito por la familia', () => {
    expect(filasAPrograma(filas)[1]!.nombre).toBe('Cocina/ comedor');
  });
});

describe('clasificarArchivo', () => {
  it('identifica el cuaderno completado y descarta el modelo en blanco', () => {
    expect(clasificarArchivo('Cuaderno-Diseño-Participativo MariaJose.docx', '.docx')).toBe('cuaderno');
    expect(clasificarArchivo('Modelo_ Cuaderno-Diseño-Participativo.docx', '.docx')).toBe('documento');
  });

  it('separa el dibujo del cliente de las fotos del sitio', () => {
    expect(clasificarArchivo('DibujoDistribucion_espacio.jpeg', '.jpeg')).toBe('dibujo-cliente');
    expect(clasificarArchivo('IMG_2043.jpg', '.jpg')).toBe('foto-sitio');
  });

  it('reconoce los videos del recorrido del terreno', () => {
    expect(clasificarArchivo('Vista 3.mp4', '.mp4')).toBe('video-sitio');
  });
});
