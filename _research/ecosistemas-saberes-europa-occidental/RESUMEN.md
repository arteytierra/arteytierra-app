# Resumen — Europa occidental

Relevamiento, no implementación. No se tocó `apps/`, `packages/` ni `supabase/`, y no se hizo commit.

## Qué se encontró

Europa occidental tiene hoy **9 ECO_ID curados para 7 fichas** en toda Europa. Consultando RESOLVE por coordenada en 80 puntos del alcance, el resultado es que **casi nada resuelve**: de los 20 ECO_ID que efectivamente aparecen en Portugal, España, Francia, Irlanda, Reino Unido, Bélgica, Países Bajos, Luxemburgo y Suiza occidental, sólo 6 tienen ficha.

Los tres huecos grandes, por superficie y por uso:

1. **664** — Bretaña, Normandía, la Beauce, Île-de-France, Aquitania, Flandes, la Campine, el Veluwe, Frisia y Zelanda. Es la matriz agrícola más transformada de Europa y hoy cae entera al bioma global.
2. **686** — Alsacia, los Vosgos, el Jura, el Macizo Central, las Ardenas, Luxemburgo y toda la meseta suiza.
3. **648** — Galicia, Asturias, Cantabria, el País Vasco, el Miño y las Landas.

## Dos fichas que prometen una cobertura que no entregan

Esto no se ve leyendo el código; salió de consultar por coordenada.

- `atlantico_templado_oceanico` declara en su encabezado `ES` y `PT`, pero su único ECO_ID (651) no toca la península. **Galicia no resuelve.**
- `templado_continental_europeo` declara `FR` y `CH`, pero ningún punto francés ni suizo cae en su ECO_ID (654). **La meseta suiza no resuelve.**

Ninguna de las dos se remapea. Se agregan las fichas que faltaban y queda anotado que, al montar, hay que corregir esos dos comentarios de encabezado, que hoy afirman algo falso.

## Tres fichas que no se activaban donde están escritas

El hallazgo más útil, y el que no cuesta casi nada arreglar:

- **`macaronesia`** tiene como saberes el enarenado, el jable, los zocos y las gavias, y su primera fuente es la ficha GIAHS de la FAO sobre Lanzarote. Pero Lanzarote y Fuerteventura devuelven **796**, no 787. La ficha nunca se encendía en la isla sobre la que está escrita.
- **`mediterraneo_europeo`** tiene como saberes la dehesa extremeña y el **montado alentejano**, y su fuente principal es el GIAHS del Montado de Serpa. El Alentejo, el Algarve, Doñana y Los Alcornocales devuelven **805**, que no estaba en la lista blanca. El montado no se activaba en el montado.
- **`alpino_montano_europeo`** dice en su resumen "Alpes, Pirineos, Cárpatos" y su propio comentario avisa que los Pirineos tienen otro ID. Ese ID es **676** y faltaba.

Los tres se resuelven con `AMPLIAR_SIN_REMAPEAR`: una línea cada uno, sin ficha nueva y sin riesgo de huérfanas.

## Qué se propone

| | |
|---|---|
| ECO_ID en alcance | 20 |
| `CONSERVAR_ACTUAL` | 6 |
| `AMPLIAR_SIN_REMAPEAR` | 5 |
| `AGREGAR` | 9 |
| `REEMPLAZAR` | 0 |
| Fichas ecológicas nuevas | 8 |
| Saberes territoriales documentados | 26, ninguno activable |
| Fichas huérfanas | 0 |
| Colisiones con `lib/` | 0 |
| Colisiones con el paquete americano | 0 |

Las 8 fichas nuevas: `atlantico_llanura_noroeste`, `templado_occidental_europeo`, `cantabrico_atlantico_iberico`, `campina_calcarea_inglesa`, `atlantico_norte_turberas`, `pinar_caledonio`, `montano_iberico`, `semiarido_sureste_iberico`.

Con esto Europa occidental pasa de 6 ECO_ID que resuelven a 20.

## Decidido

**`campina_calcarea_inglesa` (663) va como ficha propia.** Era el único corte discutible y quedó resuelto el 03/09/2026: sobre creta fisurada una zanja y una represa se comportan al revés que sobre los suelos saturados de Irlanda, que es justo lo que la app calcula. `atlantico_templado_oceanico` conserva 651 y no queda huérfana.

## Pendiente para el montaje

1. **Corregir dos comentarios de encabezado** en `biomasRegionales.ts`, que hoy declaran países que su ECO_ID no cubre.
2. **Decidir si la dehesa y el montado salen del campo `saberes`** de `mediterraneo_europeo` y pasan a la capa territorial. Hoy se le muestran a un predio de Mallorca o de la Provenza.

## Verificación ejecutada

Todo lo anterior está comprobado con script, no afirmado:

- 8 ids nuevos, 0 colisiones contra `contexto.ts`, `biomasRegionales.ts` y `biomasGlobales.ts`.
- 0 colisiones contra los 53 ids del paquete de Mesoamérica y Norteamérica.
- 9 ECO_ID a agregar y 5 a ampliar: ninguno estaba tomado en `ECO_ID_A_FICHA`.
- 0 choques contra los 143 ECO_ID del paquete americano.
- Los 6 `CONSERVAR_ACTUAL` coinciden con lo que hoy dice `lib/`.
- 8 fichas, todas con `saberes: []`, todas con fuentes, sin campos faltantes.
- Las 11 URL de las fichas devuelven 200.
- Sin credenciales en la carpeta.

## Fuera de alcance

Relevados y descartados con motivo: 644, 647, 675, 679, 701, 708, 729, 745, 780, 795, 797, 798, 806, 833 y 839 — Italia, el Adriático, el Báltico, Escandinavia y el norte de África, que corresponden a otros pases. Sin cambio: 654, 674 y 717.
