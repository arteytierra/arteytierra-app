# Resumen de entrega

## Resultado validado

- 163 ECO_ID investigados y cubiertos en el conjunto integrado.
- 20 ECO_ID ya productivos conservan su ficha actual.
- 143 ECO_ID nuevos quedan listos para agregar.
- 53 fichas ecológicas nuevas, todas con `saberes: []`.
- 20 colisiones con `lib/` resueltas sin remapeo.
- 9 colisiones entre los dos paquetes resueltas con un dueño global único.
- 0 ECO_ID faltantes.
- 0 IDs de ficha duplicados.
- 0 fichas productivas huérfanas.

## Saber territorial

- 31 entradas documentadas y convertidas a JSON.
- 31 marcadas `documentado_sin_geometria`.
- 0 activables automáticamente en producción hasta incorporar una geometría con procedencia y licencia aprobadas.

## Orden recomendado para Claude

1. Montar y probar solamente `fase-1-ecologia/`.
2. Mantener el material cultural fuera de `BiomaFicha`.
3. Diseñar el resolutor y la procedencia geométrica de fase 2.
4. Recién entonces promover, una por una, las entradas culturales aprobadas.

Los JSON originales permanecen en `insumos/` para trazabilidad y no deben convertirse directamente a TypeScript.
