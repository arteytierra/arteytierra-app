# Anteproyectos · Arte y Tierra

Generador de anteproyectos bioclimáticos. A partir del Cuaderno de Diseño
Participativo completado por la familia, el programa de necesidades y las
coordenadas del terreno, produce **3 anteproyectos con perfiles de diseño
distintos**, cada uno con planta amoblada acotada, planta de techos y fachadas.

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

La generación de imágenes queda reservada para los renders 3D ilustrativos —
un paso posterior, todavía no implementado.

## Flujo

1. **Ingesta** (`lib/ingesta/`) — lee la carpeta del proyecto, clasifica los
   archivos (cuaderno, dibujos del cliente, fotos y videos del sitio, PDFs) y
   extrae del `.docx` las 15 secciones del cuaderno y la tabla del programa de
   necesidades, mapeándola a ambientes tipados.
2. **Clima** (`lib/clima.ts`, `app/api/clima/`) — climatología de NASA POWER y
   clasificación Köppen. Portado de `apps/terreno`; cobertura global, así que
   funciona en cualquier clima, no sólo en el trópico.
3. **Motor** (`lib/motor/`) — resuelve la planta, el techo y las fachadas.
4. **Salida** — SVG en pantalla y DXF descargable para terminar en CAD.

## Los perfiles

Cada perfil organiza la planta con una lógica propia, no sólo con una
proporción distinta: si sólo cambiara el ancho, el empaquetado convergía a la
misma planta y los "tres caminos" del método Livingston quedaban en uno solo.

| Perfil | Organización | Proporción |
|---|---|---|
| Fiel al cliente | Orden en que la familia enumeró los ambientes | 3 bandas, 1.15 |
| Orgánico | Dos bandas (todo ambiente da al exterior) + envolvente curva dibujada | Φ ≈ 1.618 con geometría sagrada marcada |
| Bioclimático | Eje largo derivado del Köppen del sitio | 1.6 E-O / 0.7 N-S / 1.05 compacto |
| Autoconstrucción (opcional) | Bandas simples, fraccionadas en etapas habitables | 1.2 |

El alero, la altura libre y la técnica de muro salen del clima real del sitio
en **los cuatro perfiles** — hasta la propuesta más fiel al cliente necesita
sombra real en el trópico. Sólo la *forma* es exclusiva del perfil bioclimático.

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
- **Ambientes rectangulares.** El perfil orgánico dibuja la envolvente curva,
  pero los ambientes interiores siguen siendo rectángulos: hay que poder
  acotarlos y construirlos.
- **Puertas y ventanas esquemáticas.** Una abertura representativa por
  ambiente, no el aventanamiento definitivo.
- **Sin renders 3D** todavía.
- **Sin persistencia.** Cada sesión arranca de cero; el DXF es lo que se guarda.
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

`tests/_exportar-vista.test.ts` no es un test: genera un HTML de vista previa
con los tres anteproyectos del caso piloto.
