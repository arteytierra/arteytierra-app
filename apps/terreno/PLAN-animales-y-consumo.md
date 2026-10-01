# Plan — la tabla de animales: categorías, consumo y aves

Pedido de Jonatan, 01/10/2026, en dos partes que resultaron ser la misma:

1. Que en ganadería haya **gallinas ponedoras y pollos**.
2. Que en **pastoreo** haya animales predeterminados con su consumo, y
   **por categoría**: adultos, jóvenes, etc.

Las dos tocan el mismo archivo, y por eso van juntas: hoy el único lugar donde
la app sabe algo de un animal es `TIPOS_ANIMAL`, en `lib/produccion.ts`.

---

## 1 · Qué hay hoy, y por qué no alcanza

```ts
export const TIPOS_ANIMAL: TipoAnimal[] = [
  { id: 'bovino',    nombre: 'Bovinos adultos',  ev: 1.00, agua_l_dia: 50  },
  { id: 'bovino_j',  nombre: 'Bovinos jóvenes',  ev: 0.50, agua_l_dia: 30  },
  { id: 'equino',    nombre: 'Equinos',          ev: 1.25, agua_l_dia: 50  },
  { id: 'ovino',     nombre: 'Ovinos',           ev: 0.15, agua_l_dia: 6   },
  { id: 'caprino',   nombre: 'Caprinos',         ev: 0.12, agua_l_dia: 5   },
  { id: 'porcino',   nombre: 'Porcinos',         ev: 0.30, agua_l_dia: 20  },
];
```

Seis filas, dos números cada una, **sin una sola fuente citada**. De ahí salen
la receptividad del campo (`calcularReceptividad`), la demanda de agua del
rodeo (`rodeo.ts`) y, por esa vía, el balance mensual de la represa. Es decir:
seis constantes sin procedencia deciden cuántos animales entran en el campo y
de qué tamaño tiene que ser la represa. Es exactamente el tipo de número
plausible y equivocado del que habla `.claude/skills/motor-de-calculo`.

Tres problemas concretos, en orden de gravedad:

**a) La categoría no existe como dimensión.** «Bovinos adultos» y «Bovinos
jóvenes» son dos filas sueltas, no dos categorías de una especie. No hay vaca
con cría, ni vaquillona, ni toro, ni novillo, que son las categorías con las
que se cuenta un rodeo de verdad y las que tienen EV distinto. Y en `rodeo.ts`
el predio tiene **un solo** `animalId` con **un solo** número de cabezas: un
campo con 40 vacas, 12 vaquillonas y 2 toros no se puede cargar.

**b) El consumo de materia seca es una constante escondida.**

```ts
const consumo_ev_año = 8 * 365; // kg MS/año para 1 EV
```

8 kg MS/día para un equivalente vaca. El EV de INTA es una vaca de 400 kg que
gesta y cría un ternero hasta los 6 meses; al 2,5–3 % del peso vivo eso da
**10–12 kg MS/día**, no 8. Si el 8 está mal, la receptividad sale **entre 25 % y
50 % alta** en todos los predios del mundo, y la app lleva meses diciéndolo con
aplomo. **Esto hay que verificarlo antes que nada**, y es lo más urgente de todo
este plan: no es una función nueva, es un número que ya está en producción.

**c) Las aves no entran en este modelo, y meterlas sería peor que no tenerlas.**
Esto es lo importante del pedido 1 y conviene decirlo antes de escribir código.

---

## 2 · Por qué las gallinas NO pueden ser una fila más de `TIPOS_ANIMAL`

`TIPOS_ANIMAL` existe para contestar una pregunta: *¿cuántos animales aguanta el
pasto de este campo?* El mecanismo es el equivalente vaca, y el EV supone que
**el animal se alimenta del forraje del potrero**.

Una ponedora no se alimenta del potrero. Come entre 110 y 120 g de alimento
balanceado por día, que entra al campo en bolsas. El pasto le aporta algo de
proteína, pigmento y bienestar, pero no es su base energética.

Si le pusiéramos `ev: 0.01` a una gallina, `calcularReceptividad` contestaría
alegremente que un campo de 50 ha «aguanta 4.000 ponedoras». Ese número no es
conservador ni optimista: **es una categoría equivocada**. Lo que limita a 4.000
ponedoras no es el forraje: es el galpón, el alimento comprado, la carga de
nitrógeno sobre el suelo y la sanidad. Un productor que lea «4.000» y dimensione
con eso se funde, y la app no se habría estrellado en ningún momento.

**Entonces las aves son un modelo aparte, con sus propias preguntas:**

| Pregunta | Qué la limita | Qué necesitamos |
|---|---|---|
| ¿Cuántas aves por hectárea? | Carga de nitrógeno y recuperación del tapiz | kg N/ave/año, tope de N por ha y por año |
| ¿Cuánto come? | Nada del campo: alimento comprado | g/ave/día y conversión alimenticia |
| ¿Cuánta agua? | Bebida + limpieza | L/ave/día por temperatura |
| ¿Cuánto hay que mover el gallinero? | Recuperación del pasto y parásitos | días de ocupación y de descanso |
| ¿Cuánto produce? | Genética y manejo | huevos/ave/año; kg y días a faena |

Esa última columna es lo que hay que ir a buscar **antes** de escribir una línea.

---

## 3 · Las fuentes, primero

Nada de esto se codifica sin la fuente arriba, con nombre, edición y tabla.

**Rumiantes y equinos**
- `NRC — Nutrient Requirements of Beef Cattle`, 8.ª rev., 2016. Consumo de
  materia seca y agua por categoría y por temperatura.
- `NRC — Nutrient Requirements of Small Ruminants`, 2007 (ovinos y caprinos).
- `NRC — Nutrient Requirements of Horses`, 6.ª rev., 2007.
- **INTA**, para el equivalente vaca y la tabla de EV por categoría: es la
  referencia que usa quien trabaja en el Cono Sur, y es la que hay que citar
  para el `consumo_ev_año`. Buscar la publicación concreta y anotar la página.
  Si INTA y NRC discrepan, se muestra el rango, no el promedio.

**Aves**
- `NRC — Nutrient Requirements of Poultry`, 9.ª rev., 1994. Es viejo pero sigue
  siendo la referencia citable para consumo y agua.
- Las guías de manejo de las líneas comerciales (Hy-Line, Lohmann, ISA para
  ponedoras; Cobb, Ross para parrilleros) dan curvas de consumo y producción
  por semana de vida. **Ojo con la licencia**: son documentos de empresa. Se
  pueden citar como referencia, y los números se usan como orden de magnitud,
  pero el dato que viaja en el código tiene que poder atribuirse.
- Para carga de nitrógeno y aves en pastoreo: `USDA NRCS Conservation Practice
  Standard 590 (Nutrient Management)` y el `Agricultural Waste Management Field
  Handbook`, cap. 4, que tiene producción de estiércol y nutrientes por especie
  y por peso vivo. Es dato público del USDA y se puede usar.

**Regla de licencia**: si una fuente no se puede usar comercialmente, el número
no se escribe. Hay relevamientos previos en `_research/fuentes-suelo-clima/`.

---

## 4 · El cambio, en cuatro etapas

Cada etapa deja la app funcionando y se puede deployar sola.

### Etapa 1 — Auditar el `consumo_ev_año` (sin funciones nuevas)

Lo más barato y lo más valioso. Buscar la definición de EV de INTA, verificar
los 8 kg MS/día, corregirlos si corresponde, y dejar la fuente escrita arriba
con su rango de validez. Un test con un caso resuelto: una superficie y una
lluvia conocidas que dan una carga publicada.

Si el número cambia, **cambia la receptividad de todos los predios**. Eso se
avisa en pantalla, no se corrige en silencio: el que tenía un proyecto guardado
merece saber por qué el campo ahora aguanta menos vacas. Y el `origen: 'manual'`
de `rodeo.ts` ya existe justamente para que quien conoce su campo no quede a
merced de nuestro coeficiente.

### Etapa 2 — Categorías de verdad, y rodeo con varias categorías

`TipoAnimal` pasa a tener especie + categoría, con el EV y el consumo por
categoría y la fuente de cada fila:

```ts
export interface CategoriaAnimal {
  id: string;                    // 'bovino_vaca_cria'
  especie: Especie;              // 'bovino' | 'ovino' | … | 'ave_ponedora' | 'ave_parrillero'
  nombre: string;                // 'Vaca con cría'
  /** Equivalente vaca. null en las aves: no pastorean. */
  ev: number | null;
  pesoVivo_kg: number;
  /** Consumo de materia seca, % del peso vivo y por día. Rango, no número. */
  consumoMS_pct: [number, number];
  agua_l_dia: number;
  fuente: string;                // 'NRC Beef 2016, tabla 11-1'
}
```

Y `Rodeo` pasa de una categoría a varias:

```ts
export interface Rodeo {
  lotes: Array<{ categoriaId: string; cabezas: number; litros_animal_dia?: number }>;
  riego_m3_mes: number;
  origen: 'receptividad' | 'manual';
}
```

Esto toca `rodeo.ts`, `ProduccionPanel`, `CutFillPanel` (el rodeo del balance de
la represa) y el snapshot del proyecto. **Hay que migrar los proyectos
guardados**: un `Rodeo` viejo con `animalId` + `cabezas` se lee como un rodeo de
un solo lote. Esa compatibilidad va con un test, porque romper proyectos
guardados es la peor forma de arreglar un cálculo.

Beneficio inmediato y visible: el campo se carga como se cuenta —40 vacas con
cría, 12 vaquillonas, 2 toros— y la demanda de agua de la represa sale de la
suma de los lotes en vez de un promedio inventado por el usuario.

### Etapa 3 — Las aves, como módulo propio

`lib/aves.ts`, con el contrato de `motor-de-calculo` completo. No entra en
`calcularReceptividad` ni suma EV: es su propio cálculo, y la pestaña lo dice.

```ts
export interface ParamsAves {
  tipo: 'ponedora' | 'parrillero';
  aves: number;
  /** Sistema: fijo, semi-móvil o gallinero móvil (tractor). */
  sistema: 'fijo' | 'semimovil' | 'movil';
  area_disponible_ha: number;
  /** Para parrilleros: cuántas tandas por año. */
  tandas_anio?: number;
}

export interface ResultadoAves {
  alimento_kg_dia: number;
  alimento_kg_anio: number;        // lo que hay que COMPRAR: no sale del campo
  agua_l_dia: number;
  /** Nitrógeno al suelo, que es el límite real de la carga. */
  nitrogeno_kg_ha_anio: number;
  carga_maxima_aves_ha: number;    // por el tope de N, no por el forraje
  excedeCargaN: boolean;
  /** Sólo en sistema móvil. */
  superficie_por_traslado_m2: number | null;
  dias_ocupacion: number | null;
  huevos_anio?: number;
  carne_kg_anio?: number;
  advertencias: string[];
}
```

Lo que esto tiene que decir siempre, en pantalla y en el informe:

> El alimento de las aves **no sale del pasto de tu campo**. Son N kg al año que
> hay que comprar o producir aparte. Lo que el campo aporta es superficie para
> rotarlas y suelo que absorbe el nitrógeno.

Ésa es la frase que evita el error caro. Y la advertencia por carga de nitrógeno
tiene que ser **dura**: si la carga excede el tope, se avisa, porque pasarse de
N en un sistema de aves es cómo se contamina una napa.

Dónde va en la interfaz: `prod` (Producción) ya es el peldaño 5. Las aves son
una sección de Producción, **no** una fila del desplegable de pastoreo, para que
nadie las sume al EV por accidente. Si gana su propia pestaña, va en el peldaño
5 al lado de `pastoreo` y `silvopastura`, con su propia feature
(`analisis.produccion` alcanza; no hace falta una nueva).

### Etapa 4 — Aves en el agua y en la economía

Recién cuando el módulo esté andando: sumar la demanda de agua de las aves al
rodeo del predio (van al mismo balance de represa; una ponedora bebe poco, pero
2.000 ponedoras son medio metro cúbico por día, que ya se nota), y los huevos y
la carne a `economia.ts`.

---

## 5 · Tests que tienen que existir

- **El caso resuelto del EV**: superficie y lluvia conocidas → carga publicada.
- **Consumo de MS por categoría** contra la tabla del NRC, con tolerancia
  explícita.
- **Migración de rodeo viejo a lotes**, ida y vuelta.
- **Agua total del rodeo** = suma de los lotes, comparada a mano.
- **Carga de nitrógeno de aves** contra el ejemplo del Agricultural Waste
  Management Field Handbook.
- **Las aves no suman EV**: un test que falla si alguna categoría de aves tiene
  `ev` distinto de `null`. Es el guardián de todo este razonamiento: dentro de
  un año nadie se va a acordar de por qué, y el test lo dice por su nombre.

---

## 6 · Orden recomendado

1. **Etapa 1** ya, sola, en su propio commit. Es un número en producción que
   puede estar 25–50 % alto.
2. **Etapa 2**, que es la que pidió Jonatan para pastoreo y la que más cambia la
   experiencia de cargar un campo.
3. **Etapa 3**, las aves, que es trabajo nuevo y no corrige nada roto.
4. **Etapa 4** al final.
