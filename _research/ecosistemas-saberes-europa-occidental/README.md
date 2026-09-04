# Ecosistemas y saberes — Europa occidental

Relevamiento para ampliar la cobertura de ecorregiones de acequia en Portugal, España, Francia, Irlanda, Reino Unido, Bélgica, Países Bajos, Luxemburgo y Suiza occidental. Macaronesia entra sólo como auditoría de lo existente.

**Estado: listo para revisión. Nada montado, nada commiteado en `apps/`.**

## Método

A diferencia de los paquetes anteriores, acá los ECO_ID no se dedujeron de listados ni de la numeración de RESOLVE: se consultaron **80 puntos por coordenada** contra el FeatureServer público de RESOLVE Ecoregions 2017, el mismo servicio que usa la app en `apps/terreno/app/api/bioma/route.ts`. Cada fila de `insumos/puntos-verificados.tsv` es una respuesta real del servicio y se puede volver a correr.

Eso importa porque el hallazgo central de este relevamiento — tres fichas que no se activan en el territorio sobre el que están escritas — sólo aparece preguntando por coordenada.

## Estructura

```
fase-1-ecologia/
  fichas-ecologicas-propuestas.json   8 fichas, contrato BiomaFicha, saberes siempre []
  mapeo-eco-id-propuesto.json         20 ECO_ID en alcance + descartes con motivo
fase-2-saberes-territoriales/
  inventario-saberes-documentados.json  26 saberes, 0 activables
insumos/
  puntos-verificados.tsv              80 consultas y su respuesta
MATRIZ_ECO_ID.md
DECISIONES_COLISIONES.md
CAPAS_CULTURALES_LOCALES.md
FUENTES.md
RESUMEN.md
```

Empezá por `RESUMEN.md`.

## Las dos capas

1. **Ecología base** — una sola ficha dueña por ECO_ID, global. El país no cambia la resolución ecológica, así que `fichaDeEcorregion(ecoId)` conserva su firma. Se monta en `lib/`.
2. **Saberes territoriales** — inventario aparte con territorio mínimo, fuente y cautelas. País o Köppen nunca alcanzan para activar un saber. **No se monta** hasta que exista geometría subnacional con procedencia y licencia.

## Cifras

20 ECO_ID en alcance: 6 conservar, 5 ampliar, 9 agregar, 0 reemplazar. 8 fichas ecológicas nuevas. 26 saberes documentados y ninguno activable. Cero fichas huérfanas, cero colisiones con `lib/` y cero con el paquete de Mesoamérica y Norteamérica.

## Estado de las decisiones

El único corte discutible, si `campina_calcarea_inglesa` (ECO_ID 663) llevaba ficha propia, quedó **decidido el 03/09/2026: va separada**. Lo que queda es de montaje, no de criterio, y está al final de `RESUMEN.md`.
