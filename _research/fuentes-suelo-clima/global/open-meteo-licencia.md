# Global — Open-Meteo (aviso de licencia, no es una fuente nueva)

**Tipo:** clima y relieve
**Estado:** VIVA — **pero la app la está usando fuera de los términos**
**Prioridad sugerida:** **alta**, y no es técnica: es de licencia. Decide Jonatan.

## Por qué existe esta ficha

Relevando fuentes europeas fui a leer los términos de Open-Meteo, porque aparecía
como candidata para la serie diaria de Europa. Resulta que **`acequia` ya la usa,
en dos lugares, y la usa en la modalidad que prohíbe el uso comercial**:

| Dónde | Qué hace |
|---|---|
| `apps/terreno/app/api/clima-diario/route.ts` | serie diaria ERA5 (~10 km) — es la base de `lib/climaExtremos.ts`: percentiles, primera y última helada, tormenta de diseño |
| `apps/terreno/lib/elevacion/openmeteo.ts` | respaldo de elevación (Copernicus GLO-90) cuando GLO-30 no devuelve |

`acequia` se cobra. La API gratuita de Open-Meteo dice, literalmente, en la tabla
de planes: **"Free / Open-Access API — Commercial use ❌"**.

## Qué dicen exactamente los términos

De https://open-meteo.com/en/terms, leído el 31/08/2026:

> **Non-Commercial Use.** By using the Free API for non-commercial use you agree
> to following terms: Less than 10'000 API calls per day, 5'000 per hour and 600
> per minute. **You may only use the free API services for non-commercial
> purposes.** You accept to the CC-BY 4.0 licence […]

Y la tabla de planes:

```
                    Free / Open-Access    Standard    Professional    Enterprise
Commercial use            ❌                 ✅            ✅              ✅
Monthly Limit         300.000/mes         1M/mes       5M/mes        >50M/mes
```

Es decir: **el dato es CC-BY 4.0 y no hay problema con el dato. El problema es el
servicio.** Lo que la licencia paga no es el permiso sobre los números, es el
derecho a pegarle al servidor de ellos desde un producto que factura.

- Términos: https://open-meteo.com/en/terms
- Licencia del dato: https://open-meteo.com/en/licence
- Ley aplicable: Suiza.

## Las salidas posibles

Las escribo en orden de esfuerzo, no de preferencia — la decisión es comercial y
no me corresponde.

1. **Pagar el plan Standard.** Es lo más barato en trabajo: se agrega la
   `apikey` a las dos llamadas y no se toca nada más. Se levanta además el techo
   de 10.000 llamadas por día, que hoy es un riesgo real si la app crece: cada
   predio analizado se lleva varias.

2. **Ir a ERA5 por la fuente original.** El dato de Open-Meteo es ERA5, de
   Copernicus, y Copernicus **sí permite uso comercial** sin pagar. Pero el
   camino oficial es el Climate Data Store, que es asincrónico: se encola un
   trabajo y se espera minutos u horas por un GRIB/NetCDF. No sirve para
   responder un request de un usuario que está mirando el mapa. Ver
   `europa/cerra-land-cds.md`, donde el mismo problema descarta a CERRA.

3. **Reemplazar cada uso por separado.** La elevación es la mitad fácil: es un
   respaldo, y ya hay tres fuentes más en `lib/elevacion/`, así que se puede
   sacar sin perder casi nada. La serie diaria es la difícil: no encontré otro
   servicio que devuelva 30 años de ERA5 diario por punto, en vivo, gratis y con
   uso comercial. Si hay que resolverla sin pagar, sale por el camino 2 más una
   caché muy agresiva, y eso es un proyecto, no un cambio.

Mi lectura: **el punto 1 por ahora** —el costo es chico frente al trabajo del
punto 3— y el punto 2 como plan si algún día el volumen lo justifica. Pero lo
importante es que quede dicho, no que lo decida yo.

## Qué NO hay que hacer

Seguir como estamos y esperar. La cláusula que Open-Meteo se reserva es explícita:
*"We reserve the right to block applications and IP addresses that misuse our
service without prior notice."* Si bloquean, se caen a la vez los extremos
climáticos y un respaldo de elevación, sin aviso y en producción.

## Verificación

Términos leídos el **31/08/2026** de la página oficial. El endpoint de archivo
responde: `https://archive-api.open-meteo.com/v1/archive?latitude=40.4&longitude=-3.7&start_date=2020-01-01&end_date=2020-01-05&daily=temperature_2m_max&timezone=UTC`
devolvió 200 en 1,1 s con la serie diaria completa.
