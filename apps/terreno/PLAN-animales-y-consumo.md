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

**b) El consumo de materia seca era una constante escondida.** ✅ **AUDITADO Y
CORREGIDO el 01/10/2026** — ver la Etapa 1 más abajo. El hallazgo no fue el que
este plan anticipaba: el `8` no era un error de tipeo sino el valor de una
pastura de calidad aplicado a todo el planeta, porque **el consumo de un EV en
kilos no es una constante**: el requerimiento está definido en energía y los
kilos dependen de la densidad energética del forraje.

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

### Etapa 1 — Auditar el `consumo_ev_año` ✅ HECHA (01/10/2026)

Resultado, para que no haya que reconstruirlo:

**1 EV = 18,54 Mcal de energía metabolizable por día**, del promedio anual de una
vaca de 400 kg que gesta y cría un ternero hasta el destete a los 6 meses con
160 kg, incluido el forraje del ternero. Fuente: Cocimano, M., Lange, A. y
Menvielle, E. (1975), «Equivalencias ganaderas para vacunos de carne y ovinos»,
AACREA.

El requerimiento está en **energía**, no en kilos. Los kilos salen de dividir por
la densidad energética del forraje, y de ahí los tres números que circulan:

| Mcal EM/kg MS | kg MS/día | kg MS/año | Qué forraje |
|---|---|---|---|
| 2,32 | 8,0 | 2.920 | Pastura de calidad ← **lo que la app usaba para todo** |
| 1,87 | 9,9 | 3.620 | Pastizal natural (≈52 % digestibilidad) ← el nuevo default |
| 1,55 | 12,0 | 4.380 | Forraje grosero, maduro o diferido |

Los 3.650 y los 4.380 kg MS/año que la bibliografía cita como «el» consumo de un
EV no se contradicen entre sí ni con el 8: son el mismo requerimiento de energía
sobre forrajes distintos.

**Entonces el error no era un número mal puesto: era usar el extremo optimista
como si fuera el valor central.** La receptividad salía ~24 % alta para un
pastizal natural promedio y hasta ~50 % alta para un pastizal grosero —más
grande justo donde el margen es más fino, el campo semiárido de 700 kg
MS/ha/año—.

Cómo quedó: `EV_MCAL_EM_DIA`, `EM_FORRAJE` y `consumoEV_kgMS_dia()` en
`lib/produccion.ts`, con fuente, unidades y rango de validez.
`calcularReceptividad` devuelve el valor central **y el rango**
(`carga_ev_min` / `carga_ev_max`), porque la app no sabe qué calidad tiene el
pasto de este predio y no lo inventa. La pantalla de Ganadería dice el supuesto
y el rango en una línea. Diez tests nuevos, con dos casos resueltos: los 3.650
kg MS/año y los 9.350 Mcal EM/ha de un pastizal de 5.000 kg MS/ha.

Y un test viejo que había que corregir: esperaba `carga_ev ≈ 85,6`, o sea
**fijaba el error en lugar de encontrarlo**. Un test que sólo comprueba que la
función devuelve lo mismo que ayer no protege de nada.

Lo que esto cambió para el usuario: un campo de 100 ha con 800 mm pasa de
«aguanta 85 animales» a «aguanta 69, entre 57 y 88 según la calidad del pasto».
No se corrigió en silencio: el `origen: 'manual'` de `rodeo.ts` ya existía para
que quien conoce su campo no quede a merced de nuestro coeficiente, y ahora la
pantalla además explica de dónde sale el número.

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

1. ~~**Etapa 1**~~ ✅ hecha el 01/10/2026.
2. **Etapa 2**, que es la que pidió Jonatan para pastoreo y la que más cambia la
   experiencia de cargar un campo. **Es la próxima.**
3. **Etapa 3**, las aves, que es trabajo nuevo y no corrige nada roto.
4. **Etapa 4** al final.

Nota para la Etapa 2: ahora que el EV sale de la energía, la tabla de categorías
puede declarar su requerimiento en **Mcal EM/día** y dejar que el coeficiente EV
se derive solo (`mcal / 18,54`), en vez de escribir los dos y que se
desincronicen. Eso también deja a las aves fuera por construcción: su
requerimiento no se cubre con forraje, así que no tienen `ev`.
