# Anteproyectos · Arte y Tierra

Generador de anteproyectos bioclimáticos. A partir del Cuaderno de Diseño
Participativo completado por la familia, el programa de necesidades y las
coordenadas del terreno, produce **3 anteproyectos con perfiles de diseño
distintos**, cada uno con planta amoblada acotada, planta de techos, fachadas
y —una vez aprobadas las plantas— **5 vistas 3D** del mismo volumen.

```bash
pnpm --filter @arteytierra/anteproyectos dev
```

Corre en http://localhost:3002.

## La regla que ordena todo el diseño

**Los planos con cotas se generan por código, nunca con un modelo de imagen.**

Los generadores de imágenes no producen geometría dimensionalmente consistente:
dibujan algo que *parece* una planta, con puertas que no entran en el muro y
medidas que no suman. Acá cada línea sale de la geometría calculada en
`lib/motor/`, así que las cotas siempre cierran y el área de cada ambiente en
el plano es exactamente la del programa (hay tests que lo verifican).

El reparto de tareas es entonces:

| | Qué produce | Se puede medir |
|---|---|---|
| Motor paramétrico | planta, techos, fachadas, **vistas 3D**, DXF | **sí** |
| Generador de imágenes | render fotorrealista (materialidad, atmósfera) | **no** |

Las vistas 3D de la app son axonometrías del mismo modelo calculado, no
imágenes: por eso están acotadas y coinciden con los planos. Para la imagen
fotorrealista, `lib/render/prompt.ts` **arma el prompt desde la geometría real**
(dimensiones, técnica de muro, alero, clima, posición del sol) y lo entrega
listo para pegar en un generador de imágenes, con la advertencia de que esa
imagen ilustra y no mide.

## Flujo

0. **Proyectos** (`lib/proyectos/`, `app/api/proyectos/`) — guardar y abrir
   proyectos. Un archivo JSON por proyecto en `C:\Arte y Tierra\_anteproyectos`
   (o donde indique `ANTEPROYECTOS_DATOS`).
1. **Ingesta** (`lib/ingesta/`) — lee la carpeta del proyecto, clasifica los
   archivos (cuaderno, dibujos del cliente, fotos y videos del sitio, PDFs) y
   extrae del `.docx` las 15 secciones del cuaderno y la tabla del programa de
   necesidades, mapeándola a ambientes tipados.
2. **Clima** (`lib/clima.ts`, `app/api/clima/`) — climatología de NASA POWER y
   clasificación Köppen. Portado de `apps/terreno`; cobertura global, así que
   funciona en cualquier clima, no sólo en el trópico.
3. **Motor** (`lib/motor/`) — resuelve la planta, el techo, las fachadas y el
   volumen 3D.
4. **Salida** — SVG en pantalla, DXF descargable para terminar en CAD, SVG de
   cada vista 3D y los prompts de render en `.txt`.

Se guarda el **enunciado** del proyecto (sitio, programa, parámetros, cuaderno
leído), nunca los anteproyectos dibujados: al abrir se regeneran con el motor
actual, así un proyecto viejo no queda mostrando geometría que el motor ya no
produce.

## Los perfiles

Cada perfil resuelve un **partido distinto** — qué ambientes forman cada
banda, no sólo el orden o la proporción del rectángulo. Es la razón de ser de
ofrecer tres opciones: si las tres se organizan igual, la familia elige entre
tres versiones de lo mismo.

| Perfil | Partido | Proporción |
|---|---|---|
| Fiel al cliente | Compacta, bandas elegidas por el optimizador en el orden en que la familia enumeró los ambientes | 1.15 |
| Orgánico | Núcleo central: el espacio común en el medio, dormitorios repartidos a los dos lados + envolvente curva | Φ ≈ 1.618 con geometría sagrada marcada |
| Bioclimático | Depende del enfoque climático real del sitio (ver abajo) | Eje largo según el Köppen del sitio, defendido con fuerza |
| Autoconstrucción (opcional) | Bandas simples, fraccionadas en etapas habitables | 1.2 |

El **bioclimático** no tiene un partido fijo, porque el clima real cambia cuál
es la respuesta correcta:

- **Sombra y ventilación** (trópico) o **mixto**, con eje largo E-O y programa
  de hasta 7 ambientes: **crujía simple**. Una sola banda, cada ambiente
  pasante a dos caras — la casa corredor clásica del trópico, donde ventilar
  cruzado importa más que compactar.
- Cualquier otro caso (clima frío, árido, eje norte-sur, o un programa
  demasiado grande para una sola crujía): **compacta con zonificación
  térmica** — el núcleo de servicios de colchón contra la cara castigada,
  dormitorios con la buena orientación.

El núcleo de servicios (baño, hall, lavadero, despensa, biofiltro) no está
clavado a una banda fija: se prueba en cada extremo y como banda propia, y se
elige la posición que da la planta habitable. Sin esto, forzarlo siempre al
fondo volvía a producir baños de 40–60 cm sin que ningún ancho de edificio lo
arreglara.

Tres cosas que costó aprender:

- **Con el mismo empaquetador y sólo el orden distinto, los tres perfiles
  convergían a la misma planta.** Dado un programa, el óptimo del
  empaquetador es uno solo: probaba varios ordenamientos y elegía por
  proporción, así que la intención del perfil se perdía aunque el orden de
  entrada fuera distinto. Comparar sólo el ancho y el profundo del rectángulo
  exterior no lo detectaba — daban tres números distintos y la misma
  organización interna. La primera corrección (pesar más el orden) arregló el
  caso piloto pero **no otros programas**: con un invernadero, una casa
  grande de siete tipos o un programa sin núcleo de servicios, los tres
  perfiles volvían a coincidir. Hay un test que barre varios programas y
  climas, no sólo el piloto.
- **Imponer el orden a rajatabla tampoco servía**: el baño salía de 1,2 m y el
  hall de 0,7 m. Ver el núcleo apilado, abajo.
- **La solución final no fue pesar el orden más fuerte, sino dejar de pedirle
  al mismo empaquetador tres resultados distintos.** Cada perfil compone
  ahora sus propias bandas — qué ambientes van juntos, no sólo en qué orden —
  y sólo se optimiza el ancho de edificio que las hace habitables.

## El núcleo de servicios se apila

Todo ambiente ocupa el alto completo de su banda, así que un baño de 5 m² en
una banda de 4 m de fondo salía de 1,25 m de ancho: una tira. Y como el motor
prioriza que ningún ambiente quede inutilizable, esa restricción terminaba
dictando la planta entera y aplastaba las diferencias entre perfiles.

Ahora baño, hall, lavadero, despensa y biofiltro pueden **apilarse en columna**
dentro de una banda —baño arriba, hall abajo, compartiendo ancho— como hace
cualquier planta real con el núcleo húmedo. Se apila sólo cuando resuelve una
violación, nunca para complicar una banda que ya funcionaba.

## El alero se dimensiona por dos criterios, y manda el mayor

Sombra solar **y** protección de lluvia. Dimensionarlo sólo por geometría solar
daba el resultado más peligroso justo donde más alero hace falta: en el trópico
húmedo el sol de mediodía cae casi vertical, la sombra se resuelve con 45 cm, y
un muro de tierra con 45 cm de alero y 1.900 mm de lluvia al año se lava. El
manual lo dice sin vueltas —*"buen sombrero y buenas botas"*— y el motor ahora
lo obedece. Cada anteproyecto declara qué criterio mandó y con qué número.

## Base de conocimiento

`lib/conocimiento/` tiene los parámetros de diseño con su fuente, para que el
informe pueda decir por qué tomó cada decisión y sea auditable.

- **Manual de Bioconstrucción de Arte y Tierra** — espesores y desempeño de
  cada técnica de muro (adobe 40 cm desfasa el pico térmico 8–12 h), criterios
  de elección por clima y sismo, cimientos y sobrecimiento, proporción áurea,
  orientación bioclimática.
- Olgyay, Givoni y las Tablas de Mahoney para las estrategias por clima.
- Fuller Moore para el dimensionamiento de aleros por geometría solar.
- Passivhaus Institut, adaptado: en clima cálido el criterio no es hermeticidad
  sino control de ganancia solar y ventilación.
- Alexander (*A Pattern Language*) para la profundidad de crujía y la luz
  bilateral, que alimentan las advertencias de habitabilidad.

## Qué revisar en cada resultado

El motor marca advertencias cuando el esquema tiene problemas reales:
ambientes sin luz natural, luz de un solo lado, o profundidad excesiva. No las
oculta: son la lista de lo que hay que resolver antes de mostrarle la propuesta
a la familia.

## Límites conocidos

- **Una sola planta.** No resuelve dos niveles ni escaleras.
- **Plantas en bandas.** El motor organiza en bandas horizontales con núcleos
  de servicio apilados. No resuelve plantas en L o en U, patios internos ni
  circulaciones en espina.
- **Ambientes rectangulares.** El perfil orgánico dibuja la envolvente curva en
  planta y la galería curva en 3D, pero los ambientes interiores siguen siendo
  rectángulos: hay que poder acotarlos y construirlos.
- **Puertas y ventanas esquemáticas.** Una abertura representativa por
  ambiente, no el aventanamiento definitivo.
- **Techo siempre a dos aguas** sobre el eje largo. No resuelve cuatro aguas,
  faldones a distinta pendiente ni terrazas.
- **Las vistas 3D no son renders fotorrealistas.** Son axonometrías del volumen
  con sombreado según el sol del sitio: sin materiales, vegetación ni cielo. La
  imagen fotorrealista se genera aparte, con el prompt que arma la app.
- **No se llama a ningún generador de imágenes desde la app**: entrega el
  prompt para pegarlo donde Jonatan prefiera.
- La ingesta lee del disco local (`app/api/ingesta/`), acotada a
  `C:/Arte y Tierra` o a lo que indique `ANTEPROYECTOS_RAIZ`. Es una
  herramienta de escritorio para el estudio, no un servicio público.

## Tests

```bash
pnpm --filter @arteytierra/anteproyectos test
```

Cubren lo que tiene que ser cierto para que un plano no mienta: que el área
dibujada de cada ambiente sea la del programa, que no haya superposiciones,
que la huella sea rectangular exacta, que ningún ambiente quede por debajo de
su ancho utilizable, y que la estrategia climática y la geometría solar den
resultados correctos en ambos hemisferios.

Y lo que tiene que ser cierto para que las cuatro salidas hablen del mismo
edificio: que la altura total sea una sola —no una por fachada—, que la
cumbrera corra sobre el eje largo en el plano de techos y en el 3D, que el
punto más alto del volumen sea exactamente la cumbrera acotada, que las mismas
ventanas aparezcan en planta, en fachada y en 3D, que siempre haya una puerta
de acceso, y que el perímetro tenga un vértice por esquina real.

Y lo que tiene que ser cierto para que las tres opciones sean tres opciones:
que ningún par de perfiles produzca la misma planta —comparando la posición y
el tamaño de cada ambiente, no el rectángulo exterior—, en ambos hemisferios.

`tests/_exportar-vista.test.ts` no es un test: genera un HTML de vista previa
con los tres anteproyectos del caso piloto.
