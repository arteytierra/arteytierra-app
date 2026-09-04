# Entrega integrada: Mesoamérica, Caribe y Estados Unidos

Este paquete corrige y reúne la investigación de Centroamérica/Caribe y México/Estados Unidos sin modificar `apps/`, `packages/` ni `supabase/`.

## Decisión central

La ecorregión y el saber territorial son capas distintas:

- **Ecología base:** un `ECO_ID` de RESOLVE tiene exactamente una ficha dueña en toda la app.
- **Saber territorial:** se resuelve después, con país y una geometría subnacional, tribal, comunitaria o del sitio documentado.
- `_meta.paises` queda como dato documental; **no** es una segunda llave del resolutor ecológico.
- Köppen no activa saberes culturales.

Esto elimina los choques señalados en la revisión: mantiene separadas las fichas húmeda y seca de Puerto Rico, conserva el dueño actual del ECO_ID 527 y evita duplicar ECO_ID binacionales como 435.

## Entrega en dos fases

### Fase 1 — ecología, integrable ahora

Usar únicamente `fase-1-ecologia/`:

- `fichas-ecologicas-nuevas.json`: fichas nuevas con `saberes: []`.
- `mapeo-eco-id-nuevo.json`: sólo los ECO_ID que todavía no existen en `lib/ecorregiones.ts`.
- `decisiones-colisiones.json`: resolución explícita de cada choque.
- `reporte-validacion.json`: prueba mecánica de cobertura, unicidad y ausencia de fichas actuales huérfanas.

Al convertir a TypeScript, retirar `_meta`: es trazabilidad de investigación y no forma parte de `BiomaFicha`.

Las colisiones con `lib/` se resuelven conservando la ficha actual. No hay que borrar las fichas de Puerto Rico, bosque seco mesoamericano ni las regionales existentes de México y Estados Unidos.

### Fase 2 — saberes territoriales, después de contar con geometrías

Usar `fase-2-saberes-territoriales/` y los dos inventarios de `insumos/*/CAPAS_CULTURALES_LOCALES.md`.

No copiar los arreglos `saberes` de los JSON originales a las fichas ecológicas. Esos textos son insumo editorial y sólo pueden activarse cuando una entrada `SaberTerritorial` tenga una regla espacial suficiente.

## Qué no ingerir directamente

Los JSON de `insumos/` conservan la investigación original y sus metadatos. Sirven para trazabilidad, pero contienen las colisiones que motivaron esta normalización. El contrato de montaje es el de `fase-1-ecologia/`.

## Reproducir la validación

Desde esta carpeta:

```powershell
node .\build-integrado.mjs "C:\Arte y Tierra\0. Claude"
```

El script lee el estado real de `apps/terreno/lib/ecorregiones.ts`, por lo que falla si aparece una colisión nueva sin decisión.
