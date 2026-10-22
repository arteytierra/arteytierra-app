# Guía de implementación para Claude

## Ingesta

1. Leer `fichas-ecorregionales.json` y validar unicidad de `id`.
2. Construir un índice `country_code + ECO_ID -> fiche_id` usando `MATRIZ_ECO_ID.md` o `_meta`.
3. Mantener el `ECO_NAME` original de RESOLVE como subtítulo; la ficha agrupada sirve para el cuerpo editorial.
4. Renderizar `fuentes` al final de la ficha y conservar las atribuciones comunitarias dentro de `saberes`.

## Modelo sugerido

```ts
type CulturalLayer = {
  id: string
  countryCodes: string[]
  community: string
  ecoIds: number[]
  admin1?: string[]
  geometryRef?: string
  summary: string
  sourceUrls: string[]
  confidence: 'alta' | 'media' | 'base_ecologica'
  consentStatus: 'public_source_only' | 'community_reviewed' | 'do_not_publish'
  sensitivity: 'public' | 'localized' | 'sensitive'
}
```

No convertir la ficha JSON en recomendaciones universales. En especial, `saberes` no debe alimentar instrucciones automáticas de quema, extracción, pesca, caza, medicina o acceso a sitios.

## Resolución de solapamientos

- Filtrar primero por país y luego por ECO_ID.
- Para `US`, distinguir `CONUS`, Alaska y Hawái.
- Si un ECO_ID aparece en ambos países, usar la misma ecología base pero seleccionar la capa cultural con país + geometría local.
- Para México, `ich_kool` requiere Península de Yucatán; `chinampa_xochimilco` requiere polígono lacustre; `metepantle_tlaxcala` requiere Tlaxcala y municipios documentados.
- Para Estados Unidos, una capa tribal requiere nación/comunidad y área documentada; no inferir por nombre de estado.

## Pruebas mínimas

- Los 45 ECO_ID mexicanos resuelven a una sola ficha dentro de `MX`.
- Los 93 ECO_ID estadounidenses resuelven a una sola ficha dentro de `US`.
- Un ECO_ID binacional cambia de capa cultural al cruzar la frontera, sin cambiar necesariamente la ecología.
- Xochimilco no activa chinampas fuera del polígono lacustre.
- `ECO_ID 581` activa ecología de Everglades, pero no atribuye prácticas Miccosukee/Seminole fuera del sur de Florida documentado.
- Alaska no muestra calendarios de subsistencia ni puntos de cosecha.
- Hawái no usa `koppen_tipicos` para inferir ahupuaʻa o comunidad.
- Un punto sin capa cultural sigue mostrando vegetación, fauna, suelos y fuentes.
