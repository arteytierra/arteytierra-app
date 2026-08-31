# <País> — <Nombre de la fuente> (<organismo>)

**Tipo:** suelo | clima | precipitación | relieve
**Estado:** VIVA | INTERMITENTE | MUERTA | DESCARTADA
**Prioridad sugerida:** alta | media | baja

## Qué mejora sobre la fuente global

Contra qué compite (SoilGrids 250 m / NASA POWER ~0,5° / GLO-30) y en qué es
mejor: resolución, si es dato medido o modelado, qué variables agrega. Si no
mejora nada en concreto, decirlo: no toda fuente nacional es mejor.

## Cobertura

País entero o parcial. Bounding box aproximado `[oeste, sur, este, norte]` para
el router. Si la cobertura tiene huecos conocidos (provincias sin relevar,
años faltantes), nombrarlos.

## Licencia

Nombre exacto de la licencia y **enlace a los términos**. Decir explícitamente
si permite uso comercial y si obliga a atribuir. Si obliga a atribuir, escribir
el texto de atribución tal como hay que mostrarlo.

## Acceso técnico

- **Endpoint** exacto, con el método (GET/POST).
- **Un ejemplo real que funcione**: la URL o el cuerpo del POST completo, con
  coordenadas de prueba dentro de la cobertura.
- **La respuesta real** de ese ejemplo, recortada (30–40 líneas alcanzan), para
  ver la forma y los nombres de campo.
- Formato: JSON / WMS / WCS / WFS / CSV.
- ¿Pide clave o registro? ¿Cómo se saca, cuánto tarda, es gratis?
- Límites de request conocidos (por minuto, por día, tamaño de bbox).
- Tiempo de respuesta observado en el ejemplo.

## Campos que devuelve

Tabla: nombre del campo → qué es → unidad. Marcar cuáles equivalen a lo que ya
usa la app (para suelo: arcilla, arena, limo, pH, materia orgánica, densidad
aparente, conductividad saturada, agua útil, grupo hidrológico; para clima:
precipitación mensual, temperatura, ETP).

**Ojo con las unidades.** SSURGO, por ejemplo, da la conductividad en µm/s y la
materia orgánica en % — no en mm/h ni en g/kg como el resto de la app. Anotar la
conversión que haga falta.

## Qué falta o qué no da

Campos que la app usa y esta fuente no tiene, y con qué habría que completarlos.

## Verificación

Fecha en que se probó el ejemplo y si respondió. Una fuente que hace tres años
que no responde se marca MUERTA aunque la documentación siga publicada.
