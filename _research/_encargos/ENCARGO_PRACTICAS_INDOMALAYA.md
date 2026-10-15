# Encargo — prácticas documentadas de las 32 ecorregiones de Indomalaya


## Corregido el 10/10/2026, después del lote 01

**El lote 01 cubrió las cuatro fichas de los Ghats y vuelve a medias.** Leer
`RESPUESTAS_MUESTREOS.md` antes de seguir: seis entradas están bien y cuatro hay
que rehacerles la fuente. No hay que reescribir el lote, sólo esas cuatro.

Lo que faltaba decir, y que vale para todos los lotes que siguen:

### Qué fuente se acepta

`practicasHistoricas.ts` tiene hoy **416 URLs sobre 123 dominios** y así se
reparten las más usadas: PubMed Central (85), FAO (47), UNESCO (30), el National
Park Service de EE.UU. (27), SciELO en sus tres sedes (41), Frontiers, Ecology &
Society, MDPI, SciELO Brasil, Redalyc, Parks Canada, organismos nacionales.
**Ninguna es de periodismo.** Ese es el piso, y lo fijó el archivo con la
práctica.

Entonces, una fuente entra si cumple las tres:

1. **Abre hoy.** Si no se puede abrir, no se puede desmentir, y una afirmación
   que no se puede desmentir no entra. Probarla antes de escribirla.
2. **Es la publicación, no un intermediario.** ResearchGate, Academia.edu,
   Scribd y los agregadores de acceso abierto son *hosts*: hay que llegar al
   artículo en la revista, el repositorio institucional o el organismo. Si sólo
   existe en el agregador, decirlo en `nota`.
3. **Es un trabajo publicado, no una nota periodística.** Un diario o un sitio de
   divulgación puede servir para *encontrar* el dato; la cita es el trabajo que
   está detrás. Si no hay ninguno detrás, la entrada va a `vacias`.

**Y una advertencia sobre el tamaño:** una nota de dos páginas en el número 2 del
volumen 1 de una revista sin presencia indexada no alcanza para fechar una
práctica en el territorio de alguien. No es esnobismo: es que no hay con qué
contrastarla.

### Mejor tres entradas sólidas que cuatro con una floja

Si de una ficha salen dos prácticas bien sostenidas y la tercera obliga a estirar
la fuente, **se entregan dos**. Una ficha con dos prácticas que aguantan vale más
que una con tres donde una no se puede chequear, porque la que no aguanta
contamina la confianza en las otras dos.
*Pegar primero `GPT_LOCAL_REGLAS.md` y después esto. Entregas en
`C:\Arte y Tierra\encargos-gpt\entregas\practicas-indomalaya\NN.json`.*

---

## Qué es una práctica, en este catálogo

Un registro **fechado y sin dueño declarado** de qué se hizo en ese territorio
para producir: cómo se maneja el suelo, el agua, el pastoreo, el cultivo o el
monte.

**El sujeto es el registro, no el terreno.** No se dice "acá se hace X": se dice
"X está documentado en esta región desde tal fecha". Y **no se le atribuye la
práctica a un pueblo salvo que la fuente lo haga**, con las palabras de la
fuente. A escala de una ecorregión viven muchos pueblos y ninguno la ocupa
entera: decir "los X hacen Y" a partir de un paper sobre una aldea es inventar,
y además ofende.

Que no se pueda decir **de quién** es una práctica no impide decir **qué se hizo
acá y cuándo**. Eso es todo lo que hay que fechar.

## La forma de cada entrada

```json
{
  "id": "java_bali_montano",
  "practica": "Subak",
  "periodo": "Documentado desde el siglo IX; en uso",
  "tipo": "agua",
  "vigencia": "en_uso",
  "detalle": "Dos a cuatro oraciones. Qué es, cómo funciona, qué resuelve. Concreto y físico: la pendiente, los metros, el orden del agua, qué se planta. Nada de adjetivos.",
  "fuentes": [{ "label": "Título tal como lo muestra la página", "url": "https://…" }],
  "verificacion": "Qué dice esa página, con sus palabras."
}
```

- `tipo`: uno de `suelo`, `agua`, `pastoreo`, `cultivo`, `monte`, `energia`.
- `vigencia`: uno de `en_uso`, `en_retroceso`, `historica`.
- `periodo`: lo que diga la fuente. Si dice "prehispánica", va "prehispánica".
  Si no fecha nada, **la entrada no entra**: lo fechado es la mitad del valor.

**Entre 2 y 3 prácticas por ecorregión.** Si de una salen cinco, van las tres
mejor documentadas. Si sale una sola, va una sola. Si no sale ninguna que
aguante la verificación, va a `vacias` con el motivo.

## Las 32 ecorregiones

Un lote de **4 ecorregiones por respuesta**, en este orden. El nombre es el que
usa la app y alcanza para ubicarlas.

**Lote 01** — `ghats_norte_deciduo` (bosques húmedos deciduos de los Ghats del
norte) · `ghats_norte_montano` (selvas montanas de los Ghats del norte) ·
`ghats_sur_deciduo` (bosques húmedos deciduos de los Ghats del sur) ·
`ghats_sur_montano` (selvas montanas y sholas de los Ghats del sur)

**Lote 02** — `sri_lanka_humedo_bajo` · `sri_lanka_montano` ·
`sri_lanka_zona_seca` (zona seca de Sri Lanka) · `valle_brahmaputra`

**Lote 03** — `gangetica_inferior` (llanura gangética inferior) ·
`gangetica_superior` · `pantanos_sundarbans` · `pantanos_irrawaddy`

**Lote 04** — `irrawaddy_deciduo` · `pantanos_chao_phraya` ·
`chao_phraya_deciduo` · `pantanos_tonle_sap` (bosques inundables del Tonlé Sap)

**Lote 05** — `pantanos_rio_rojo` (delta del río Rojo, Vietnam) · `sumatra_bajo` ·
`sumatra_montano` (Barisan) · `pantanos_sumatra`

**Lote 06** — `pinar_toba` (pinares tropicales de Toba) ·
`java_occidental_bajo` · `java_oriental_bali_bajo` · `java_bali_montano`

**Lote 07** — `pantanos_borneo_suroeste` · `luzon_bajo` · `luzon_montano` ·
`pinar_luzon` (Cordillera Central de Luzón)

**Lote 08** — `mindoro` · `negros_panay` (Negros, Panay y Cebú) ·
`mindanao_montano` · `mindanao_visayas_oriental`

## Lo que ya se sabe de esta región y conviene no repetir mal

Estas 32 fichas se montaron hace poco y su texto ya nombra la vegetación, los
suelos y los cultivos de cada lugar. Lo que falta es exactamente el registro
fechado de las prácticas. Dos cosas que ya están establecidas y que la entrega
no tiene que redescubrir ni contradecir:

- **Trece de estas ecorregiones son aluvión joven recargado por la creciente**,
  con arrozales continuos desde hace siglos: Brahmaputra, las dos gangéticas,
  Sundarbans, Irrawaddy, Chao Phraya, Tonlé Sap, río Rojo, suroeste de Borneo,
  Sumatra. No son suelos pobres de selva lavada.
- **Java, Bali, Luzón y Mindanao se sostienen sobre andisoles volcánicos
  jóvenes**: entre los suelos más fértiles del planeta, con horticultura
  continua desde hace siglos.

Hay sistemas de riego, terrazas y manejo de agua con bibliografía abundante en
casi todas: subak balinés, aflaj no, pero sí los *tank cascade systems* de la
zona seca de Sri Lanka, el *muang fai* del norte de Tailandia, los arrozales en
terraza de la Cordillera de Luzón, el *sawah* javanés, el *bheri* de los
Sundarbans. **No tomar esta lista como respuesta**: es la señal de que la
bibliografía existe. Cada una se verifica igual, abriendo la fuente.

## Dónde buscar, en orden de rendimiento

1. **FAO SIPAM/GIAHS** — publica fichas de sistema agrícola por sitio, con
   descripción técnica. Varios de estos países tienen sitios reconocidos.
2. **UNESCO** — sitios del patrimonio mundial de paisaje cultural (los arrozales
   de la Cordillera filipina y el subak balinés están inscriptos, con
   documentación técnica en el expediente).
3. **IWMI** (International Water Management Institute) para los sistemas de riego
   del sur de Asia; publica en abierto.
4. **ICRAF / CIFOR** para los sistemas agroforestales de la Sonda.
5. **Revistas con acceso abierto** del país: hay bastante publicado por
   universidades indias, de Sri Lanka, indonesias y filipinas.

Evitar las enciclopedias colaborativas y los blogs de turismo: no sirven como
fuente de una afirmación fechada.
