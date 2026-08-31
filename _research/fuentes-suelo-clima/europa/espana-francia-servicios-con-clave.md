# España y Francia — AEMET OpenData y Météo-France DPClim

**Tipo:** clima
**Estado:** VIVAS — **sin verificar la respuesta**: las dos exigen clave y no se
pidió ninguna
**Prioridad sugerida:** **EN PAUSA** desde el 31/08/2026 — decisión de Jonatan.

No están descartadas por licencia ni por calidad: quedan guardadas. El motivo es
que lo que se iba a buscar en Europa —una clasificación climática que no
dependiera de una celda de 50 km— lo resolvió
[el mapa Köppen de 1 km de Beck](../global/koppen-beck-1km.md), que además cubre
el planeta entero y no sólo España y Francia. Lo que estas dos sumarían encima de
eso es dato de estación, y sale caro: hay que pedir dos claves, escribir dos
adaptadores distintos y cargar con dos secretos más en producción, para mejorar
dos países.

**Qué las volvería a poner en la cola:** que aparezca una necesidad de dato de
estación —serie diaria real de un punto, no climatología— y que España o Francia
sean mercado. Antes de eso, no. La ficha se queda por eso: para no volver a
relevarlas desde cero.

Van juntas en una ficha porque comparten el mismo veredicto y el mismo obstáculo:
son servicios meteorológicos nacionales, sirven dato de estación, y **no
devuelven nada sin clave**. La regla del README es probar el endpoint de verdad y
pegar la respuesta real; acá eso no se pudo hacer, y la ficha lo dice en vez de
inventarlo.

## Qué mejoran sobre la fuente global

Lo mismo que el DWD alemán, y con las mismas limitaciones: son **estaciones**, no
grillas. Aportan medición real donde hay estación —incluida radiación medida y
ráfagas— y no aportan nada donde no la hay.

España tiene una ventaja concreta sobre Alemania para nuestro caso: AEMET publica
**normales climatológicas ya calculadas por estación** (`/valores/climatologicos/
normales/estacion/{id}`). Eso es exactamente la forma que la app consume —doce
meses agregados— sin tener que sumar treinta años de horas. Si alguna fuente
europea de estación va a entrar primero, es ésta.

## Cobertura

- **AEMET:** España peninsular, Baleares, Canarias, Ceuta y Melilla.
  Bounding box: `[-18.2, 27.6, 4.4, 43.8]` (el hueco de longitud hasta −18 es por
  Canarias; hay mucho océano adentro).
- **Météo-France:** Francia metropolitana y departamentos de ultramar.
  Bounding box metropolitano: `[-5.2, 41.3, 9.6, 51.1]`.

## Licencia

**Las dos permiten reutilización, incluida la comercial, con atribución** — es el
régimen general de datos abiertos de los dos países. Pero *no se leyeron los
términos completos en esta pasada*, porque sin resolver el acceso no valía la
pena. **Antes de implementar cualquiera de las dos hay que leer y citar los
términos**, igual que se hizo con el DWD y con el BGR, y anotar acá la fórmula de
atribución exacta.

- AEMET: https://opendata.aemet.es/
- Météo-France: https://portail-api.meteofrance.fr/

## Acceso técnico

### AEMET OpenData

- **Endpoint:** `GET https://opendata.aemet.es/opendata/api/...`
- **Documentación viva:** https://opendata.aemet.es/dist/index.html (responde 200)
- **Pide clave:** sí, gratuita, se solicita por mail desde el portal y llega
  automáticamente. No se pidió.

**Probado sin clave** el 31/08/2026:

```
GET https://opendata.aemet.es/opendata/api/valores/climatologicos/normales/estacion/3195/
→ 200, cuerpo vacío (0 bytes)

GET https://opendata.aemet.es/opendata/api/valores/climatologicos/normales/estacion/3195?api_key=
→ 401
{
  "descripcion" : "API key invalido",
  "estado" : 401
}
```

Lo primero es una trampa: **responde 200 con el cuerpo vacío**, no un error. Un
adaptador que sólo mire `res.ok` va a creer que funcionó y va a parsear la nada.
Hay que tratar el cuerpo vacío como fallo explícito.

Y una particularidad de AEMET que conviene saber antes de empezar: **la API
contesta en dos pasos**. La primera llamada no trae los datos, trae un JSON con
una URL temporal en el campo `datos`; hay que ir a buscarlos ahí. Son dos
requests por consulta, y la segunda URL caduca.

### Météo-France DPClim

- **Endpoint:** `GET https://public-api.meteofrance.fr/public/DPClim/v1/...`
- **Pide clave:** sí, con registro en el portal de APIs. No se pidió.

**Probado sin clave** el 31/08/2026:

```
GET https://public-api.meteofrance.fr/public/DPClim/v1/information-station
→ 401
{
  "code": "900902",
  "message": "Missing Credentials",
  "description": "Invalid Credentials. Make sure your API invocation call has a header:
                  'Authorization : Bearer ACCESS_TOKEN' or 'Authorization : Basic ACCESS_TOKEN'
                  or 'apikey: API_KEY'"
}
```

Éste sí falla limpio: 401 con mensaje claro. Va más abajo en prioridad que AEMET
por dos razones: no publica normales ya calculadas —hay que pedir la serie y
agregarla— y varios de sus endpoints de clima funcionan por **encargo asincrónico**
(se pide un archivo y se lo va a buscar después), que es el mismo problema que
descarta a CERRA.

## Campos que devuelven

**Sin verificar.** Las tablas de campos se completan cuando se pruebe con clave.
Lo que la documentación anuncia, para orientar la decisión:

| Fuente | Lo que ofrece |
|---|---|
| AEMET `normales/estacion` | doce meses de temperatura media, máxima y mínima, precipitación, humedad y días de helada — ya agregados |
| AEMET `diarios/estacion` | serie diaria por estación |
| Météo-France DPClim | series horarias, diarias, mensuales y decadales por estación |

**Ojo con las unidades.** No verificadas. AEMET usa **coma decimal** en varios
campos numéricos que además vienen como texto (`"12,4"`), que es la misma trampa
que el `Shape Area` del BGR alemán: un `parseFloat` corta en el entero y no
protesta.

## Qué falta o qué no da

- **La verificación.** Es lo que falta, y es todo lo que falta. Las dos fichas
  quedan a medias a propósito: sin clave no hay respuesta real que pegar, y
  escribir una inventada sería peor que no escribirla.
- **Grilla.** Ninguna de las dos da climatología en grilla; son estaciones.

## Verificación

Probado el **31/08/2026**, sólo hasta donde llega sin credenciales: la
documentación de AEMET responde 200, el endpoint de normales devuelve 200 vacío
sin clave y 401 con clave inválida, y el de Météo-France devuelve 401. **Ninguna
respuesta con dato real fue verificada.** Para cerrar estas fichas hay que sacar
las dos claves, que son gratuitas; las claves no van acá (regla del README).
