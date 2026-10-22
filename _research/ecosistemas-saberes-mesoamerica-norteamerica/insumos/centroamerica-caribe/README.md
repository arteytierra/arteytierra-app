# Ecosistemas naturales y saberes de Centroamérica y el Caribe

Investigación preparada para ampliar las fichas de contexto de **acequia** sin modificar `apps/`, `packages/` ni `supabase/`.

## Qué contiene

- `fichas-ecorregionales.json`: fichas con el mismo contrato de datos que las fichas de Argentina (`id`, `nombre`, `resumen`, `vegetacion`, `fauna`, `suelos`, `saberes`, `especies`, `fuentes`) y metadatos para RESOLVE.
- `CAPAS_CULTURALES_LOCALES.md`: prácticas que no deben activarse para toda una ecorregión; requieren país y, en varios casos, provincia/comarca/polígono local.
- `MATRIZ_ECO_ID.md`: correspondencia entre los `ECO_ID` de RESOLVE y las fichas propuestas.
- `RESUMEN.md`: prioridades y decisiones de implementación para Claude.
- `FUENTES.md`: fuentes institucionales, alcance de cada una y cautelas de uso.

## Alcance

La cobertura incluye los siete países del istmo (Belice, Guatemala, Honduras, El Salvador, Nicaragua, Costa Rica y Panamá) y el Caribe insular: Antillas Mayores, Bahamas, Antillas Menores, Trinidad y Tobago y los principales territorios caribeños. México se conserva en los metadatos cuando comparte una ecorregión, pero las fichas mexicanas específicas deben vivir en el bloque México.

No se intentó convertir cada tradición en una receta agronómica. Los saberes se presentan como contexto territorial y principios de manejo documentados. No se publican localizaciones de sitios sagrados, instrucciones medicinales ni conocimientos sensibles.

## Regla de activación

1. Usar `ECO_ID` de **RESOLVE Ecoregions 2017** para elegir la ficha ecológica.
2. Aplicar además `_meta.paises`; un mismo polígono ecológico atraviesa países con historias culturales distintas.
3. Para una práctica de `CAPAS_CULTURALES_LOCALES.md`, exigir la regla territorial indicada. **Köppen nunca basta para activar un saber cultural.**
4. Si falta la condición territorial, mostrar únicamente ecosistema, vegetación, fauna y suelos; omitir el saber localizado.
5. Mantener visible la atribución a la comunidad y enlazar la fuente. La app no debe presentar el conocimiento como universal, extinto ni libre de derechos colectivos.

## Calidad y límites

- `alta`: fuente institucional o publicación técnica directamente vinculada al lugar y práctica.
- `media`: evidencia sólida, pero la ficha agrupa variantes ecológicas o el alcance territorial requiere una capa más fina.
- `base_ecologica`: la ficha ecológica es implementable, pero no se asigna un saber cultural concreto sin una fuente local adicional.

URLs y servicio cartográfico revisados el **2026-09-03**. La licencia CC BY 4.0 de RESOLVE permite el uso con atribución. Los textos de este paquete son síntesis originales; las fuentes enlazadas respaldan los hechos y no se copian de forma extensa.

