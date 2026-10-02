# Curso "Especialización en Planificación de Tierras" — relevamiento

Material de origen: 20 presentaciones en PDF del curso que cursó Jonatan en 2025,
en `C:\Planificacion de Tierras\solo diap` (fuera del repo, y ahí se queda).
Extraídas a texto con `pdftotext -layout -enc UTF-8` el 01/10/2026.

- [notas-por-clase.md](notas-por-clase.md) — lo que dice cada clase, con los números,
  las tablas y las fórmulas, y marcado qué se verificó contra los ejemplos resueltos.

El plan de qué hacer con esto en la app vive en
`apps/terreno/PLAN-curso-planificacion-tierras.md`.

## Las clases

| # | Clase | Capa Regrarians |
|---|---|---|
| 2 | Clima de la biosfera y clima legal | 1 Clima |
| 3 | Clima de la mente — contexto holístico | 1 Clima |
| 4 | Masterplan, conceptualización y modelo de pastoreo | — |
| 5 | Cartografía, herramientas de medida y modelos de terreno | 2 Geografía |
| 6 | Elementos topográficos | 2 Geografía |
| 7 | Zonificación y modulación ganadera | 2 Geografía |
| 8 | Requerimientos y fuentes de agua | 3 Agua |
| 9 | Obras de tierra para almacenamiento y manejo de agua | 3 Agua |
| 10 | Tanques, cañerías y accesorios | 3 Agua |
| 11 | Cálculos de hidráulica | 3 Agua |
| 12 | Sistemas presurizados para distribución y riego | 3 Agua |
| 14 | Posicionamiento de caminos y sus consecuencias | 4 Accesos |
| 15 | Tipos de accesos, detalles constructivos, alcantarillado | 4 Accesos |
| 16 | Cortinas, frutales, huerta, sombra y abrigo | 5 Ecosistema |
| 17 | Patrones de cultivo | 5 Ecosistema |
| 18 | Posicionamiento de estructuras, logística, orientación | 6 Estructuras |
| 19 | Subdivisiones: protección y fraccionamientos | 7 Subdivisiones |
| 20 | Subdivisiones ganaderas | 7 Subdivisiones |
| 21 | Replanteo a campo, plan de pastoreo, evaluación de suelo | 8 Suelo |
| — | Entendiendo la aplicación de la geometría Keyline (G. Pavlov, HUMA) | anexo |

Falta la clase 1 (Google Earth) y la 13 en la carpeta; no hacen falta.

## Fuentes primarias que el curso cita

Son las que podemos usar nosotros, citándolas directo:

- **K.D. Nelson (1985), _Design and Construction of Small Earth Dams_** — la clase 9
  entera es un resumen de este libro. Tablas de ancho de cresta, taludes y libre bordo.
- **Regrarians Handbook (Darren J. Doherty y Andrew Jeeves)** — tabla de coeficientes de
  cultivo (p. 176), comparativa de caños (p. 232), tabla 2.1 de comparación de métodos de
  trazado (cap. 2, pp. 69 y 96) y la fórmula de alcantarillado.
- **Winchester & Morris (1956)**, adaptado en **NASEM (2016)** — consumo de agua del
  ganado por categoría y temperatura.
- **FAO-56 (Allen et al. 1998)** — ETc = ETo · Kc. Ya es la base de `lib/riego.ts`.
- **P.A. Yeomans (1954, 1958, 1965, 1971)** y **Georgi Pavlov / HUMA** — geometría Keyline.
- **Savory Institute** — Manejo Holístico, contexto holístico y EOV.
- **Jairo Restrepo** — cromatografía de suelos y preparados. **Francis Chaboussou** — trofobiosis.
- **Köppen-Geiger en la versión de Murray C. Peel** (nosotros usamos Beck 1 km, que es mejor).
- **NOM-127-SSA1-2021** (México) y normativa de Uruguay — calidad de agua para consumo.
- **Zaman, Shahid y Heng, cap. 5 _Irrigation Water Quality_**; Follett y Soltanpour 2002;
  Bauder et al. 2011; Ludwick et al. 1990 — calidad de agua para riego.
- **CONEAT** (Uruguay) — clasificación de suelos con índice de productividad.
- **Bianchi y Cravero (2010)**, _Atlas Climático Digital de la República Argentina_;
  Servicio Meteorológico Nacional; **IPCC Interactive Atlas (CMIP6)**.

## Lo que NO es nuestro

Las diapositivas, los planos de los proyectos de sus clientes, las fotos, los criterios
que el autor marca explícitamente como propios ("criterio propio", "criterio
desarrollado por nosotros") y la redacción del curso son del autor del curso. No se
copian a la app ni a la guía. Lo que sí podemos hacer es ir a la fuente primaria que el
curso cita y calcular desde ahí, que además es lo que pide la skill `motor-de-calculo`:
fuente con nombre propio, no "según la bibliografía".

Donde el curso aporta un criterio propio que no tiene respaldo publicado y nos parece
bueno (por ejemplo, las horas en las que se concentra la bebida según la distancia al
bebedero), hay dos caminos honestos: buscar la fuente que lo respalde, o pedirle permiso
al autor para citarlo como comunicación personal. Lo que no se hace es presentarlo como
si fuera nuestro ni como si fuera bibliografía.
