# Encargo — fuentes propias, lote 04: norte de África y Sahara (las 13, completo)

*Pegar primero `GPT_LOCAL_REGLAS.md` y después esto, en un chat nuevo y suelto.
Entrega en `C:\Arte y Tierra\encargos-gpt\entregas\fuentes-propias\04.json`.*

Este archivo se lee solo: no hace falta el encargo general ni nada del proyecto.

Es el doble de grande que los anteriores a propósito: son **las 13 que quedan del
norte de África**, o sea el paquete completo. Si salen, ese bloque se cierra.

---

## El problema, que no es la falta de fuentes

Un catálogo de fichas ecorregionales describe suelos, vegetación y manejo de cada
ecorregión del mundo. Cada ficha cita tres o cuatro fuentes, y aun así **50 de
ellas no se pueden chequear**, porque esas fuentes son las mismas de todo el
paquete: un atlas de suelos continental, una capa global de ecorregiones, una
base de datos mundial. Respaldan que la ficha existe; no respaldan lo que la
ficha afirma de **ese** lugar.

Lo que hace falta es, por ficha, **una fuente del lugar**: una medición, un
inventario, un plan de manejo, una tesis, un artículo regional. Una sola alcanza.

## Las trece de este lote

Los `id` son los del catálogo y están verificados: hay que copiarlos tal cual,
porque un id que no existe hace que la entrada no se muestre nunca.

| `id` | Dónde |
|---|---|
| `magreb_bosque_mediterraneo` | Rif, Cabilia, Tell y Cabo Bon — la franja húmeda del norte |
| `atlas_conifera_montana` | Cedral del Atlas Medio, Alto Atlas, Rif alto y Aurés, 1.400–2.600 m |
| `alto_atlas_enebro` | Enebral por encima del cedral, 2.400 m al Toubkal |
| `nilo_delta` | Delta y valle del Nilo |
| `chotts_sebkhas` | Chott el Yerid, Chott Melrhir, depresión de Qattara |
| `sahara_norte_estepa` | Atlas sahariano, Suf, Mzab, borde libio y egipcio — la franja del oasis |
| `sahara_occidental_erg` | Gran Erg Occidental y Oriental, Hamada del Draa, Erg Chebbi |
| `sahara_oriental` | Gran Mar de Arena y oasis del desierto occidental egipcio (Siwa, Bahariya, Farafra, Dajla, Jarga) |
| `sahara_sur` | Sur profundo de Argelia y Libia, extremo del desierto egipcio |
| `sahara_costa_atlantica` | Litoral de Sidi Ifni a Dajla — el desierto de niebla atlántico |
| `ahaggar_tassili` | Macizos del Ahaggar y el Tassili n'Ajjer, sur de Argelia |
| `uweinat_tibesti` | Yebel Uweinat (Egipto–Libia–Sudán) y Tibesti |
| `mar_rojo_costa_desierto` | Desierto oriental egipcio, montañas del mar Rojo, Gebel Elba |

## Qué tiene que cumplir la fuente

Las cuatro, y no es negociable ninguna:

1. **Abre hoy.** Probá la URL antes de escribirla. Si no se puede abrir, no se
   puede desmentir, y una afirmación que no se puede desmentir no sirve.
2. **Es la publicación, no un intermediario.** ResearchGate, Academia.edu,
   Scribd y los agregadores de acceso abierto son *hosts*. Hay que llegar al
   artículo en la revista, el repositorio institucional, la universidad o el
   organismo. Si existe un DOI, va el DOI.
3. **Es un trabajo publicado, no una nota periodística.** Un diario puede servir
   para *encontrar* el dato; la cita es el trabajo que está detrás.
4. **No está retractada.** Esta condición es nueva y salió del lote anterior: el
   artículo que se eligió para el desierto arábigo existe **dos veces**, y la
   versión que aparece primero buscando por título es la retractada. Las otras
   tres condiciones una retractación las cumple igual de bien que un artículo
   vivo. Si hay dos registros del mismo trabajo con DOI distinto, fijate cuál
   dice «RETRACTED» y cuál no, y poné el DOI del bueno.

Y una advertencia de tamaño: una nota de dos páginas en el número 2 del volumen 1
de una revista sin presencia indexada no alcanza. No es esnobismo — es que no hay
con qué contrastarla.

## Qué tiene que decir la fuente

Algo concreto y comprobable sobre **el lugar**: un tipo de suelo clasificado, una
profundidad, un contenido de materia orgánica, una lista de especies relevada, una
superficie, una serie de lluvia, un rendimiento, un sistema de riego descrito, un
caudal, una cota.

**No** sirve una fuente que confirme que la ecorregión existe o que repita su
descripción general. Eso ya lo tenemos y es justo el problema.

## La forma de cada entrada

```json
{
  "id": "nilo_delta",
  "sobre": "suelos",
  "fuentes": [
    { "label": "título completo de la publicación, sin abreviar", "url": "https://…" }
  ],
  "verificacion": "Qué dice literalmente la fuente, con sus números y su alcance: dónde se midió, cuándo, cuántos sitios, qué valores.",
  "nota": "El alcance real: de qué lugar es esta fuente y de qué lugar NO habla."
}
```

- **`sobre`**: uno de `suelos`, `vegetacion`, `clima`, `agua`, `manejo`.
- **`verificacion`** es el campo que más importa y tiene que ser **literal**. Lo
  que escribas acá se va a copiar al texto que lee el usuario, así que todo
  número que pongas tiene que estar en el documento. En el lote 01 una entrada
  afirmó dos superficies en hectáreas y dos franjas de altitud que no aparecían
  en ninguna de las 7.619 líneas del plan de manejo que citaba: la fuente era
  buena, los números no eran de ahí. **Si no estás seguro de que un número está
  en el documento, no lo pongas.** Y si lo único que podés leer es el resumen,
  decilo: «el resumen informa que…» es una respuesta correcta y se puede montar.
- **`nota`** no es un trámite: es lo que vuelve usable a la fuente. «Ocho perfiles
  de un campo de lava, no todos los harrat» es la clase de frase que hace falta.
  Una fuente del lugar es de un lugar, y pretender que cubre la ecorregión entera
  es volver al problema del principio.

## Dónde conviene buscar en esta zona

- **Los institutos nacionales**: INRA Marruecos y el IAV Hassan II, el INRGREF y
  el IRA de Medenine en Túnez, el INRAA argelino, el Centro Nacional de
  Investigación y el Instituto de Investigación del Desierto de Egipto. Publican
  suelos, agua y pastoreo de su propio territorio.
- **ICARDA** y el **Observatorio del Sahara y el Sahel (OSS)**, para la franja
  árida y la estepa.
- **Ramsar**: el Chott el Yerid, el Chott Melrhir, el Garaet y varias sebkhas son
  sitios Ramsar, y las fichas informativas describen suelos, hidrología y uso.
- **UNESCO**: el Tassili n'Ajjer es Patrimonio Mundial y el Tibesti y el Uweinat
  tienen bibliografía de expedición; las reservas de biosfera marroquíes
  (Arganeraie, Oasis del Sur) traen caracterización física.
- Para el **delta del Nilo**, la literatura de salinización y de la pérdida de
  limo después de Asuán es abundante y está en revistas egipcias indexadas.
- Para los **oasis**, la bibliografía de *foggara*, *khettara* y *qanat* está bien
  publicada, igual que la del Sistema Acuífero de Arenisca Nubia y el del Sahara
  Septentrional (SASS).
- Para la **costa atlántica** y el **Gebel Elba**, buscá los trabajos de
  vegetación de niebla: son los que miden lo que hace particular a esas dos
  fichas.

## Lo que no entra

- Ningún número sin fuente abierta y verificada.
- Ninguna fuente que hable de un país entero cuando la ficha es de una
  ecorregión, salvo que lo digas en `nota` y el dato igual sirva.
- Ninguna extrapolación. Si de una ficha no sale nada que cumpla, va en `vacias`
  con el motivo, y eso es una respuesta correcta y útil. Trece fichas con once
  fuentes buenas y dos vacías justificadas es un lote mejor que trece forzadas.

## La entrega

Un solo bloque JSON, sin prosa alrededor:

```json
{
  "encargo": "fuentes-propias",
  "lote": 4,
  "fecha": "2026-10-12",
  "entradas": [ … ],
  "vacias": [ { "id": "…", "motivo": "…" } ]
}
```
