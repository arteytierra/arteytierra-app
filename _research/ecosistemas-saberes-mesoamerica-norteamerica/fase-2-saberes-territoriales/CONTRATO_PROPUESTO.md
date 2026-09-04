# Contrato propuesto para la fase 2

```ts
interface SaberTerritorial {
  id: string;
  nombre: string;
  portadores: string[];
  paises: string[];
  ecoIdsCompatibles?: number[]; // filtro, nunca activador único
  sintesisPublica: string;
  cautelas: string[];
  fuentes: Array<{ label: string; url: string; revisada: string }>;
  territorio: {
    estado: 'documentado_sin_geometria' | 'listo_para_revision' | 'aprobado';
    tipo: 'sitio' | 'admin' | 'territorio_indigena' | 'comunitario';
    geometriaId?: string;
    fuenteGeometria?: string;
    licenciaGeometria?: string;
  };
}
```

## Regla de activación

1. Resolver la ficha ecológica por `ECO_ID`.
2. Consultar saberes territoriales por punto.
3. Exigir coincidencia de país, geometría aprobada y compatibilidad ecológica si está declarada.
4. Si no hay geometría, no activar el saber en producción.

## Estado de esta entrega

Los inventarios narrativos están completos en:

- `../insumos/centroamerica-caribe/CAPAS_CULTURALES_LOCALES.md`
- `../insumos/mexico-estados-unidos/CAPAS_CULTURALES_LOCALES.md`

Todavía no se incluyen polígonos. Por eso todas las capas deben considerarse `documentado_sin_geometria`. La fase 2 requiere una decisión de procedencia/licencia y, cuando corresponda, revisión con las comunidades o autoridades portadoras.
