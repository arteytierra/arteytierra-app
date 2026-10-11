# Cobertura — Sudamérica A, B y C

Fecha de cierre: 2026-09-14.

## Entrega

| Archivo | Lote operativo | Fichas documentadas |
|---|---|---:|
| `sudamerica-a.json` | Bases pendientes, Amazonia, Andes norte, Caribe continental y Guayaquil | 12 |
| `sudamerica-b.json` | Orinoquia, sabanas, Andes centrales y Brasil interior | 12 |
| `sudamerica-c.json` | Mata Atlántica, montañas del Caribe, manglares e inundables amazónicos | 8 |
| **Total nuevo** |  | **32** |

La Prioridad 1 de Argentina permanece en `prioridad-1-argentina.json` con 12 fichas y no se duplicó en estos lotes.

## Control de calidad

- Los 32 `fichaId` son únicos y pertenecen al anexo de 222 IDs.
- Todos los objetos respetan el contrato: `fichaId`, `practica`, `periodo`, `tipo`, `vigencia`, `detalle`, `fuentes`, `verificacion`.
- `tipo` y `vigencia` usan solamente los valores permitidos.
- Cada ficha tiene al menos una fuente publicada con URL HTTPS.
- Las citas de verificación tienen como máximo 25 palabras.
- No se reutilizó una práctica de una ecorregión como prueba de otra por semejanza ambiental.

## IDs relevados pero no publicados por falta de evidencia específica suficiente

### Lote A

- `bosque_humedo_occidente_ecuador`
- `campinaranas_aguas_negras`
- `guayanas_bosques_inundables_delta`

### Lote B

- `humedales_orinoco`
- `pantepui_guayana_alta`
- `bosque_seco_mato_grosso`

### Lote C

- `mata_atlantica_seca`
- `matorrales_xericos_caribe_suramericano`
- `manglares_amazon_orinoco_caribe_sur`
- `bosque_juan_fernandez`
- `galapagos_matorral_xerico`
- `isla_malpelo_xerica`
- `islas_desventuradas`

Estos IDs se dejan intencionalmente sin ficha: las fuentes encontradas eran ecológicas, demasiado generales, inaccesibles o no demostraban una práctica en esa ecorregión concreta.
