---
name: fuente-unica-de-verdad
description: Qué hacer cuando un número o un identificador vive en más de un lugar — precios, topes de plan, nombres de plan, límites, features habilitadas. Se activa al cambiar un precio o un tope, al renombrar un plan o un identificador que la base también conoce, al escribir una vidriera o una tabla de planes, y cuando la app y el sitio dicen cosas distintas.
---

# Un número, un dueño

Este proyecto no falla estrellándose. Falla **afirmando algo que otra parte del
sistema contradice**: la vidriera anuncia un precio y el checkout cobra otro, la
landing promete 50 proyectos y la base corta en 10. Nadie ve una excepción.
Alguien paga y después descubre.

En dos días aparecieron tres casos de esta misma familia:

- `apps/web/lib/terreno/planes.ts` anunciaba Profesional a **USD 12** mientras
  el checkout cobraba **15**.
- La misma vidriera decía **"proyectos ilimitados"** cuando el trigger de la
  base cortaba en **10** desde la 0054.
- `lib/plans.ts` de la landing `acequia.app` promete **50 proyectos** para
  Estudio; el tope real es **10**. Y manda `plan=disenador` al checkout, un
  identificador renombrado el 11/09/2026 que hoy sólo funciona por un alias de
  compatibilidad.

Ninguno se cometió por descuido: se cometieron porque el número estaba escrito
en varios lugares y nada los comparaba.

## El dueño

**`packages/config/src/acequia.ts` es el único lugar donde se decide un precio,
un tope de proyectos o una cantidad de asientos.** Todo lo demás lee de ahí.

Los cinco lugares donde el mismo número aparece, y cómo se mantienen atados:

| Dónde | Qué dice | Cómo se ata |
|---|---|---|
| `packages/config/src/acequia.ts` | la verdad | es el dueño |
| `apps/terreno/lib/entitlements.ts` | topes y features por plan | importa `ACEQUIA_PLANS` |
| `apps/web/lib/terreno/planes.ts` | la vidriera de arteytierra.org | importa `ACEQUIA_PLANS` |
| `supabase/migrations/` (trigger de límite) | el tope que se aplica de verdad | **copia en SQL**, atada por test |
| `lib/plans.ts` de `acequia-landing` | la vidriera de acequia.app | **copia a mano en otro repo, sin atar** |

Las dos últimas filas son el riesgo. El SQL no puede importar TypeScript y la
landing está en otro repositorio.

## La técnica que funciona: un test que compara dos fuentes

Para el SQL ya existe y hay que copiar el patrón, no reinventarlo:
`apps/terreno/tests/unit/planes/catalogo.test.ts` lee el archivo de migración,
le saca los números del `CASE` con una expresión regular y los compara contra
`ACEQUIA_PLANS`. Si alguien cambia uno de los dos lados, el test falla.

Un detalle de ese test que vale entender: **no busca la migración por nombre de
archivo.** Busca, entre todas las migraciones, la última que contenga el `CASE`
del límite. Si buscara `0057_*.sql` por nombre, la 0062 que redefina el trigger
dejaría el test verificando una migración muerta, en verde, para siempre.

```ts
const archivo = readdirSync(dir)
  .filter((n) => n.endsWith('.sql'))
  .sort().reverse()
  .find((n) => readFileSync(join(dir, n), 'utf8').includes('lim := CASE plan_usuario'));
```

Un test que pasa mirando el lugar equivocado es peor que no tenerlo.

## Antes de cambiar un número

1. `git grep` el número **y** su contexto en los dos repos. Un precio de 15
   aparece como `15`, como `'USD 15'`, como `150` anual y quizá escrito en
   palabras en un texto de marketing.
2. Cambialo en `packages/config` y dejá que el resto lo derive.
3. Corré el test de planes. Si no falla cuando debería, el test está mirando el
   lugar equivocado.
4. Acordate de la landing: está en otro repo y **no se entera**.

## Renombrar un identificador que la base conoce

Un `id` de plan no es una etiqueta: viaja en URLs de checkout, queda guardado en
la metadata de pagos ya cobrados y está en constraints `CHECK` de la base. Al
renombrar hay que tocar los cuatro lados y **dejar un alias de compatibilidad**,
porque los links viejos y los pagos ya hechos siguen usando el nombre anterior.

Así quedó el caso `disenador` → `profesional`:

```ts
/** Acepta el identificador actual y el viejo `disenador`. */
export function resolveAcequiaPaidPlan(value: string): AcequiaPaidPlanId | null {
  if (isAcequiaPaidPlan(value)) return value;
  if (value === 'disenador') return 'profesional';
  return null;
}
```

Ese alias es una red, no una excusa: mientras exista, alguien puede seguir
mandando el nombre viejo y nadie se entera. Antes de borrarlo hay que confirmar
que ningún cliente lo manda — y hoy la landing todavía lo manda.

## El default de un `CASE` es el valor más restrictivo

Dos triggers de límite tenían `ELSE NULL`, y `NULL` ahí significaba **sin
tope**. Un plan con un nombre no contemplado —exactamente lo que produce un
renombre hecho a medias— podía crear proyectos sin límite. El default de un
`CASE` que decide un permiso, un tope o un precio va al valor más restrictivo,
nunca al más permisivo. Si no sabés qué plan es, es el plan gratis.

## Al escribir una vidriera

La vidriera es una afirmación comercial, y una afirmación que el producto no
cumple es peor que una pantalla fea.

- Cada número que sale en pantalla viene de `ACEQUIA_PLANS`, interpolado, no
  tipeado.
- "Ilimitado" no se escribe nunca salvo que **no exista** un tope en la base.
- Una feature se anuncia sólo si `entitlements.ts` la habilita para ese plan.
  Ahí está la lista real de lo que cada plan da.
- Si algo está construido pero apagado por una bandera —hoy la prueba de 3 días
  y los pagos— la vidriera **no lo promete** hasta que la bandera esté prendida.
- Lo que está declarado pero sin implementar se dice con esas palabras. Los 5
  asientos de Estudio existen como número y no existen como función: hoy se
  resuelven a mano. La landing lo dice bien: *"en preparación"*.
