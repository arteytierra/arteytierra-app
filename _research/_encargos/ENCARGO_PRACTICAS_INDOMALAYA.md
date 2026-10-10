# Encargo — prácticas documentadas de las 32 ecorregiones de Indomalaya

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
