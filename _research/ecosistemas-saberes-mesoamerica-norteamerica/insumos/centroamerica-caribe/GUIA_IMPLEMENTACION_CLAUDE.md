# Guía breve para Claude

## Archivos a consumir

1. Importar objetos desde `fichas-ecorregionales.json` al catálogo regional existente.
2. Construir el mapa `ECO_ID -> id` con `_meta.ecoregiones_resolve`.
3. Aplicar `_meta.paises` antes de devolver una ficha cuando el polígono RESOLVE cruza fronteras.
4. Implementar `CAPAS_CULTURALES_LOCALES.md` como una segunda resolución, no como nuevos biomas.

## Validaciones automáticas sugeridas

- `id` único.
- Un solo dueño por `ECO_ID` en este paquete.
- Cada ficha con al menos una fuente y una nota de confianza.
- Cada saber localizado con `country_code` y, si corresponde, `admin1` o geometría.
- Si el país no coincide, conservar la ficha ecológica pero filtrar el saber.
- Si no hay geometría local, no activar Viñales, Cockpit Country, Quesungual, Kuxur Rum, nainu, Mayangna, Bribri/Cabécar o Kalinago.

## Modelo sugerido para saberes

```ts
type SaberTerritorial = {
  id: string;
  fichaId: string;
  cultura: string;
  sintesis: string;
  countryCodes: string[];
  admin1?: string[];
  geometryId?: string;
  sourceUrls: string[];
  confianza: 'alta' | 'media' | 'pendiente';
  sensible: boolean;
};
```

`sensible: true` indica que el texto visible ya fue reducido y que no deben añadirse coordenadas, recetas medicinales, calendarios de extracción o datos ceremoniales desde la fuente.

## Casos de prueba mínimos

| Punto aproximado | Resultado ecológico esperado | Saber permitido |
|---|---|---|
| Petén, Guatemala | `selva_maya_peten_yucatan` | Concesiones de Petén si cae en capa; no “Ich Kool” automático. |
| Lempira, Honduras | `corredor_seco_centroamericano` | Quesungual solo dentro de zona cargada. |
| Oriente de Guatemala | `corredor_seco_centroamericano` | Kuxur Rum solo en municipios Ch’orti’. |
| Talamanca, Costa Rica | `talamanca_caribe_sur` | Cacao Bribri/Cabécar si coincide territorio/fuente. |
| BOSAWAS, Nicaragua | `bosque_atlantico_mosquitia` o pinar según ECO_ID | Mayangna solo dentro de territorio. |
| Darién, Panamá | `darien_humedo_panama` | Nainu solo en área Guna. |
| Viñales, Cuba | `cuba_bosques_karst_y_pinares` | Paisaje cultural de Viñales dentro del polígono UNESCO. |
| Cockpit Country, Jamaica | `jamaica_bosque_humedo_karstico` | Maroon con capa local; sin ubicaciones sensibles. |
| Dominica fuera de Kalinago Territory | `antillas_menores_bosques_humedos_secos` | No activar saber Kalinago automáticamente. |
| Guánica, Puerto Rico | `puerto_rico_bosques_humedos_secos` | Bosque seco; no descripción húmeda de Luquillo. |

## Atribución cartográfica

Mantener en la vista de fuentes una atribución equivalente a:

> Ecoregiones: Dinerstein et al. (2017), RESOLVE Ecoregions, CC BY 4.0.

No copiar al bundle imágenes o PDFs enlazados. El JSON contiene redacción original y enlaces bibliográficos.

