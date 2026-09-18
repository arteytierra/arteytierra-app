# Cobertura — fuentes de pueblos originarios por país

Verificación actualizada el 2026-09-18. Argentina no se vuelve a relevar porque el encargo la declara terminada.

| País | ¿Registro? | ¿Censo? | ¿Descargable? | Licencia apta | Qué falta |
|---|---|---|---|---|---|
| Chile | Sí. Capa pública SMA/CONADI basada en el RNAI, 4.311 puntos vigentes. | Sí. Censo 2024, 2.105.863 personas; tablas por región y comuna. | Sí. Registro por API paginada; censo en XLSX. | Registro: no dice. Censo: sí, CC BY-SA 4.0, con atribución y CompartirIgual. | Conseguir una licencia explícita para reutilizar comercialmente la capa del registro y confirmar con CONADI una exportación pública del RNAI que no mezcle años de georreferenciación ni repita claves. |
| Bolivia | Sí, pero no como base pública. El RIPIO registra la identidad de pueblos solicitantes en trámites TIOC. | Sí. Censo 2024, 4.302.484 personas autoidentificadas; tabulados por departamento, provincia y municipio/TIOC. | Registro: no. Censo: sí, cuatro XLSX, cuestionario y metadatos. | Registro: no dice. Censo: no se aprueba para uso comercial sin confirmación escrita del INE; sus términos no otorgan una licencia y condicionan el uso comercial. | Obtener del Viceministerio de Tierras una exportación del RIPIO con cobertura, campos, coordenadas y licencia; pedir al INE autorización o aclaración escrita para uso comercial de los tabulados. |

## Estado de Chile

- JSON válido y todos los campos del contrato presentes.
- Registro: 4.311 filas comprobadas mediante cinco páginas de la API; 0 geometrías nulas.
- Censo: XLSX de 582.740 bytes abierto; 16 regiones y 346 comunas suman exactamente el total nacional.
- La capa administrativa no queda aprobada para montaje comercial porque no declara licencia.
- El censo permite uso comercial, pero las adaptaciones quedan sujetas a atribución y CompartirIgual.

## Estado de Bolivia

- JSON válido y todos los campos del contrato presentes.
- RIPIO: existencia y contenido mínimo confirmados en normativa oficial, pero sin base pública, filas ni licencia verificables; por eso `verificado` queda en `false`.
- Censo: cuatro XLSX abiertos. Los nueve departamentos, 113 provincias y 343 municipios/TIOC cierran exactamente con el total nacional.
- El cuadro de declaraciones tiene 133 categorías y suma 4.302.484; `Sin especificar` registra 83.684.
- El cuadro referencial tiene 57 categorías positivas y suma el mismo total; el INE aclara que el listado no es oficial ni vinculante.
- Los términos del INE no son una licencia abierta y restringen o condicionan el uso comercial, por lo que se requiere confirmación escrita antes del montaje en un producto pago.

## Verificación al montar — 18/09/2026

Lo escrito arriba es el relevamiento. Esto es qué pasó cuando se fue a montar.

**Chile: montado, sólo el censo.** Commit en `apps/terreno/lib/censoIndigena2024Cl.ts`,
auditoría en `../censo-2024-pueblos-chile/AUDITORIA.md`. Se comprobaron las tres
planillas: 16 regiones, 56 provincias, 346 comunas, todo cierra contra el total
nacional. El `P2-Pueblos-indigenas.xlsx` bajado pesa los 582.740 bytes que dice
el JSON.

Dos correcciones al relevamiento:

- **`pueblos` tiene 12 entradas y los pueblos son 11.** «Otro» es una columna de
  la planilla junto a «Pueblo no declarado», no un rótulo de pueblo: son las
  20.631 personas que se reconocen de un pueblo que no está entre las
  alternativas. Tomarla como pueblo habría publicado doce.
- **El denominador.** El JSON pone `poblacion_base: 18370540`, que es el de la
  cifra oficial del INE (11,5%) y es correcto, pero ese número **no está
  publicado por comuna**. La app divide por población censada —18.480.432— en
  los cuatro niveles y muestra 11,4%, con la cifra del INE al lado.

Lo demás se verificó como está: la licencia CC BY-SA 4.0, la falta de licencia
de la capa SMA/CONADI, el límite de 1.000 registros de la API y la nota de
actualización del 04/12/2025.

**Bolivia: no se monta.** El relevamiento está bien y el censo cierra, pero los
términos del INE prohíben el uso comercial sin autorización previa. Es la regla
6 del encargo. Lo que lo destraba es una autorización escrita del INE, no más
relevamiento: el JSON queda listo para el día que esté.

**Para los que siguen:** dos cosas que este par dejó como lección. La columna
residual («Otro», «Sin especificar», «Otras declaraciones») nunca es un pueblo y
va contada aparte. Y conviene decir, cuando el organismo publica un porcentaje,
**sobre qué denominador lo calcula**: si no está publicado al nivel más fino, la
app tiene que usar otro y explicarlo.
