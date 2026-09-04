# Prompt para Claude — Europa occidental

Mientras se termina de normalizar la entrega de Centroamérica, Caribe, México y Estados Unidos, avanzá solamente con el **relevamiento de Europa occidental**. No montes todavía los paquetes americanos ni modifiques sus catálogos.

La tarea es investigación, no implementación. No toques `apps/`, `packages/` ni `supabase/`. Trabajá en una carpeta nueva:

`C:\Arte y Tierra\0. Claude\_research\ecosistemas-saberes-europa-occidental\`

Primero revisá las fichas europeas que ya existen en `apps/terreno/lib/biomasRegionales.ts` y los ECO_ID ya tomados en `apps/terreno/lib/ecorregiones.ts`. Para cada ECO_ID investigado declarás una de estas acciones: `CONSERVAR_ACTUAL`, `AMPLIAR_SIN_REMAPEAR`, `REEMPLAZAR` o `AGREGAR`. No propongas un reemplazo sin explicar qué ficha quedaría huérfana y cómo se evita.

Separá desde el inicio dos capas:

1. **Ecología base:** una sola ficha dueña por ECO_ID global; sin saberes locales dentro de la ficha.
2. **Saberes territoriales:** inventario separado con pueblo/comunidad/portadores, país, territorio mínimo, fuente, cautelas y estado de geometría. País o Köppen nunca bastan para activar un saber.

Alcance sugerido: Portugal, España, Francia, Irlanda, Reino Unido, Bélgica, Países Bajos, Luxemburgo y, para continuidad biogeográfica, Suiza occidental. Incluí Macaronesia sólo como auditoría de lo ya existente; no la dupliques. Documentá también vacíos y descartes.

Entregables:

- `README.md`
- `fichas-ecologicas-propuestas.json` con `saberes: []`
- `MATRIZ_ECO_ID.md`
- `DECISIONES_COLISIONES.md`
- `CAPAS_CULTURALES_LOCALES.md`
- `FUENTES.md`
- `RESUMEN.md`

Usá fuentes oficiales, académicas o de organismos internacionales. Para saberes tradicionales, registrá atribución y límites de uso; no publiques sitios sensibles ni conviertas fuego, medicina, recolección, pesca o pastoreo en recetas universales. No hagas commit. Avisá cuando el relevamiento esté listo para revisión, sin integrarlo a `lib/`.
