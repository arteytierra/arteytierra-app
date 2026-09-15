# Revisión del primer lote — 15/09/2026

Entregó GPT como "bloque H". Se montaron **15 de 17** entradas en
`apps/terreno/lib/practicasHistoricas.ts`.

## Lo primero: el lote no es de Argentina, y la culpa es del anexo

El encargo pedía empezar por "H. Argentina — 22 fichas". **Ese bloque no era
Argentina.** El anexo se generó con un script que mapeó el rótulo "H. Argentina
(fichas curadas a mano)" a `lib/biomasRegionales.ts` sin mirar qué contiene: sus
22 ids propios son de Norteamérica, Mesoamérica, el Caribe y Europa.

Peor: el mismo script no leyó `lib/contexto.ts`, que es exactamente donde viven
las fichas argentinas —pampa, chaco seco, monte, espinal, yungas, puna y
altoandino, estepa patagónica, bosque andino-patagónico, selva paranaense—. El
anexo decía 210 fichas; son **222**.

GPT trabajó los ids que se le dieron, encontró fuente para 17 de 22, y **avisó
de la inconsistencia** en su nota de cobertura. Hizo lo correcto. El encargo
funcionó; el insumo estaba mal.

El anexo se regeneró leyendo los nueve catálogos, con los bloques rotulados por
lo que contienen y una sección "Prioridad 1 — Argentina" con las 12 fichas cuyo
propio texto nombra al país. (`desierto_costero` quedó afuera: nombra a la
Argentina sólo dentro de un comentario de la heurística Köppen que cae en su
rango, pero es Atacama y Sechura.)

## Verificación de las fuentes

Se abrió cada URL y se buscó la frase de `verificacion` palabra por palabra.

**15 de 17 verificadas.** Las dos que faltan no fallaron la cita: no se pudo
abrir el archivo.

| Ficha | Por qué no |
|---|---|
| `sur_templado_humedo_eeuu` | `srs.fs.usda.gov` tiene el **certificado TLS vencido**; bajando con `-k`, el PDF no entrega capa de texto legible. |
| `bosque_mesofilo_montana` | El PDF "Cien casos" de CONABIO (8,8 MB) tampoco entrega texto extraíble. |

Las dos quedaron **sin montar**. Sin fuente verificada no entra, aunque el
dominio sea de un organismo real. Si alguien puede abrir esos PDF y confirmar la
frase, se montan sin pedirle nada nuevo a GPT: el JSON está acá al lado.

Dos avisos para la próxima: UNESCO devuelve **403** a cualquier cliente sin
cabeceras de navegador (la de `macaronesia` se verificó recién al mandarlas), y
un HTML entre palabras rompe la búsqueda literal —la cita de `pradera_pastos_cortos`
parecía fallar y el problema era una etiqueta entre "arrived" y la coma—.

## El error editorial: la autoría callada

Tres entradas tenían el nombre del pueblo en su propia cita de respaldo y lo
ocultaban en el texto publicado:

- `desiertos_calidos_norteamericanos` — la fuente dice *"the Hohokam practiced
  irrigated agriculture"*.
- `taiga_borde_agricola` — *"local Ojibwe tribes used fire to promote the
  harvest"*.
- `bosque_humedo_tropical_caribeno` — *"The Taino were a pre-Columbian farmer
  society"*.

La regla 5 del encargo dice las dos cosas —no inventar la autoría y no borrarla—
pero estaba escrita con el énfasis puesto en la primera mitad, y GPT aplicó sólo
esa. Callar una autoría que la fuente afirma no es prudencia: es borrarla.

Se agregó la atribución al `detalle` de las tres, como la nombra la fuente, y se
reescribió la regla 5 del encargo separando los dos errores opuestos.

## Lo que sí salió bien

El sujeto es el registro en las 17 ("la síntesis histórica documenta…", "el
registro del valle del Salt documenta…"), ninguna atribuye por deducción, los
períodos usan rangos abiertos, y todos los detalles explican qué limitante del
lugar resuelve la práctica —que es la regla 6 y la más fácil de incumplir—.
Largo de 274 a 370 caracteres. Las 17 pasan los filtros mecánicos del test.
