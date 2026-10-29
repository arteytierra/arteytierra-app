# Ecosistemas naturales y saberes de México y Estados Unidos

Investigación para ampliar las fichas territoriales de **acequia** con el mismo contrato editorial usado en Argentina y en el bloque Centroamérica-Caribe. No modifica `apps/`, `packages/` ni `supabase/`.

## Contenido

- `fichas-ecorregionales.json`: 38 fichas ecológicas listas para transformar al catálogo de la app.
- `MATRIZ_ECO_ID.md`: cobertura exhaustiva de los 45 ECO_ID que intersectan México y los 93 que intersectan Estados Unidos según RESOLVE 2017.
- `CAPAS_CULTURALES_LOCALES.md`: saberes y sistemas de manejo con filtro territorial, atribución y cautelas.
- `FUENTES.md`: fuentes institucionales y alcance de uso.
- `RESUMEN.md`: orden de implementación sugerido.
- `GUIA_IMPLEMENTACION_CLAUDE.md`: reglas de integración y pruebas.

## Contrato

Cada objeto contiene `id`, `nombre`, `emoji`, `color`, `resumen`, `vegetacion`, `fauna`, `suelos`, `saberes`, `especies`, `fuentes` y `_meta`. En `_meta` se agregan `koppen_tipicos`, `ecorregiones_resolve`, `paises`, `confianza` y `notas`.

## Regla de activación

1. Elegir la ficha ecológica por `ECO_ID` de RESOLVE.
2. Confirmar `_meta.paises`; varios polígonos cruzan la frontera México–Estados Unidos.
3. Activar un saber solo si coincide además con el territorio documentado en `CAPAS_CULTURALES_LOCALES.md`.
4. Köppen describe clima; **nunca identifica cultura**.
5. En Estados Unidos, la reserva o área de servicio no equivale por sí sola al territorio histórico ni autoriza publicar conocimiento tribal.
6. Si no existe filtro local confiable, mostrar ecología y omitir el saber.

## Salvaguardas

Las síntesis describen principios públicos de manejo, no recetas ceremoniales ni inventarios de lugares sensibles. No publicar sitios sagrados, coordenadas de recolección, calendarios finos de cosecha/caza/pesca, usos medicinales ni conocimiento comunicado bajo confianza. La consulta y el consentimiento no se reemplazan con una cita web.

En Estados Unidos las tribus reconocidas federalmente son gobiernos soberanos; en México los derechos colectivos, la libre determinación y los sistemas normativos comunitarios requieren atribución y pertinencia territorial. El conocimiento vivo pertenece a sus comunidades portadoras.

## Calidad

- `alta`: fuente institucional o tribal directamente vinculada con el lugar y la práctica.
- `media`: síntesis ecológica sólida, pero la capa cultural requiere validación local antes de producción.
- `base_ecologica`: ecología implementable; no mostrar saber localizado hasta obtener fuente/consentimiento apropiados.

Servicio RESOLVE y URLs revisados el **2026-09-03**. RESOLVE declara CC BY 4.0. Los textos son síntesis originales y deben conservar sus enlaces de atribución.
