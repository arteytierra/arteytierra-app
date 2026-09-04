# Matriz ECO_ID — Europa occidental

Cada ECO_ID de esta matriz fue verificado por consulta puntual al FeatureServer público de RESOLVE Ecoregions 2017, el mismo servicio que usa `apps/terreno/app/api/bioma/route.ts`. Ninguno se dedujo del nombre ni de la numeración: se preguntó por coordenada y se anotó la respuesta.

## En alcance — 20 ECO_ID

| ECO_ID | ECO_NAME | Bioma | Países | Acción | Ficha |
|---|---|---|---|---|---|
| 645 | Azores temperate mixed forests | 4 | PT | CONSERVAR_ACTUAL | `macaronesia` |
| 648 | Cantabrian mixed forests | 4 | ES, PT, FR | **AGREGAR** | `cantabrico_atlantico_iberico` |
| 651 | Celtic broadleaf forests | 4 | IE, GB | CONSERVAR_ACTUAL | `atlantico_templado_oceanico` |
| 663 | English Lowlands beech forests | 4 | GB | **AGREGAR** | `campina_calcarea_inglesa` |
| 664 | European Atlantic mixed forests | 4 | FR, BE, NL, LU | **AGREGAR** | `atlantico_llanura_noroeste` |
| 668 | Madeira evergreen forests | 4 | PT | CONSERVAR_ACTUAL | `macaronesia` |
| 672 | North Atlantic moist mixed forests | 4 | GB, IE | **AGREGAR** | `atlantico_norte_turberas` |
| 676 | Pyrenees conifer and mixed forests | 4 | ES, FR, AD | AMPLIAR_SIN_REMAPEAR | `alpino_montano_europeo` |
| 686 | Western European broadleaf forests | 4 | FR, BE, LU, CH, DE | **AGREGAR** | `templado_occidental_europeo` |
| 689 | Alps conifer and mixed forests | 5 | FR, CH, IT, AT… | CONSERVAR_ACTUAL | `alpino_montano_europeo` |
| 691 | Caledon conifer forests | 5 | GB | **AGREGAR** | `pinar_caledonio` |
| 787 | Canary Islands dry woodlands and forests | 12 | ES | CONSERVAR_ACTUAL | `macaronesia` |
| 788 | Corsican montane broadleaf and mixed forests | 12 | FR | AMPLIAR_SIN_REMAPEAR | `mediterraneo_europeo` |
| 792 | Iberian conifer forests | 12 | ES | **AGREGAR** | `montano_iberico` |
| 793 | Iberian sclerophyllous and semi-deciduous forests | 12 | ES, PT | CONSERVAR_ACTUAL | `mediterraneo_europeo` |
| 796 | Mediterranean Acacia-Argania dry woodlands | 12 | ES (Lanzarote, Fuerteventura) | AMPLIAR_SIN_REMAPEAR | `macaronesia` |
| 799 | Northeast Spain and Southern France Mediterranean forests | 12 | ES, FR | AMPLIAR_SIN_REMAPEAR | `mediterraneo_europeo` |
| 800 | Northwest Iberian montane forests | 12 | ES, PT | **AGREGAR** | `montano_iberico` |
| 803 | Southeast Iberian shrubs and woodlands | 12 | ES | **AGREGAR** | `semiarido_sureste_iberico` |
| 805 | Southwest Iberian Mediterranean sclerophyllous | 12 | PT, ES | AMPLIAR_SIN_REMAPEAR | `mediterraneo_europeo` |

Resumen: 6 conservar, 5 ampliar, 9 agregar. Cero `REEMPLAZAR`, cero ficha huérfana.

## Puntos verificados

Los 80 puntos consultados y su respuesta están en `insumos/puntos-verificados.tsv`. Los que definen cada decisión:

| Punto | lat, lng | ECO_ID | Hoy resuelve |
|---|---|---|---|
| Bretaña | 48.10, -3.00 | 664 | no |
| Flandes | 51.05, 3.70 | 664 | no |
| Veluwe | 52.10, 5.80 | 664 | no |
| Ardenas | 50.20, 5.60 | 686 | no |
| Meseta de Berna | 46.95, 7.45 | 686 | no |
| Galicia | 42.80, -8.20 | 648 | no |
| Chilterns | 51.70, -0.85 | 663 | no |
| Cairngorms | 57.10, -3.65 | 691 | no |
| Hébridas | 57.70, -7.20 | 672 | no |
| Alentejo | 38.20, -8.00 | 805 | no |
| Provenza | 43.80, 5.70 | 799 | no |
| Cabo de Gata | 36.80, -2.10 | 803 | no |
| Lanzarote | 29.00, -13.60 | 796 | no |
| Ariège (Pirineos) | 42.80, 1.40 | 676 | no |
| Extremadura | 39.10, -6.20 | 793 | sí, `mediterraneo_europeo` |
| Connemara | 53.50, -9.85 | 651 | sí, `atlantico_templado_oceanico` |
| Valais | 46.20, 7.50 | 689 | sí, `alpino_montano_europeo` |
| Tenerife | 28.30, -16.60 | 787 | sí, `macaronesia` |

## Fuera de alcance, relevados y descartados

Aparecen en la caja de consulta pero corresponden a otro pase: 644, 647, 675, 679, 701, 708, 729, 745, 780, 795, 797, 798, 806, 833 y 839. Ya mapeados y sin cambio: 654, 674 y 717. El detalle y el motivo de cada descarte está en `fase-1-ecologia/mapeo-eco-id-propuesto.json`.
