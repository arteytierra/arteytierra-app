# Fases y criterios de aceptación

## Fase 1 — montaje ecológico

Objetivo: ampliar cobertura sin cambiar el significado de las fichas ya productivas.

Orden de montaje:

1. Validar el contrato de `BiomaFicha` y los IDs únicos.
2. Mantener `fichaDeEcorregion(ecoId)` como función puramente ecológica.
3. Conservar todas las asignaciones que ya existen en `ECO_ID_A_FICHA`.
4. Agregar sólo `mapeo-eco-id-nuevo.json` y las fichas referidas por él.
5. Rechazar en build cualquier ECO_ID con más de un dueño global.
6. Probar que ninguna ficha regional existente queda sin ECO_ID.

Criterios de aceptación:

- un dueño por ECO_ID en el catálogo combinado;
- cero IDs de ficha duplicados;
- cero fichas actuales huérfanas;
- los ECO_ID 495 y 543 continúan en fichas distintas;
- el ECO_ID 527 continúa en `bosque_tropical_seco_mesoamericano`;
- los ECO_ID binacionales no dependen del país para elegir ecología;
- todas las fichas nuevas de fase 1 tienen `saberes: []`.

## Fase 2 — saber territorial

Objetivo: mostrar conocimientos y prácticas únicamente donde la fuente permite atribuirlos.

No se cambia la firma de `fichaDeEcorregion`. Se agrega un resolutor separado, conceptualmente:

```ts
saberesTerritoriales({ lat, lng, countryCode, admin1, ecoId })
```

El `countryCode` sirve como filtro negativo, nunca como prueba suficiente. Para activar una entrada hace falta una geometría aprobada del territorio, sitio, municipio o sistema documentado.

Criterios de aceptación:

- atribución visible a pueblo/comunidad/portadores;
- fuente y fecha de revisión visibles;
- geometría con procedencia y licencia registradas;
- sin coordenadas de sitios sagrados, recolección, pesca, caza o conocimiento restringido;
- fuego cultural descrito como contexto, no como receta operativa;
- una entrada sin geometría queda `documentada_sin_geometria` y no se muestra automáticamente;
- las naciones tribales de Estados Unidos se tratan como gobiernos soberanos; una fuente pública no equivale a consentimiento.
