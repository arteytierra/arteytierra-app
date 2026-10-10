# Cómo trabaja GPT en esto — el contrato, una sola vez

*Escrito el 10/10/2026. Este archivo es la primera mitad de cualquier encargo:
se pega al principio de la sesión nueva y después se pega el `ENCARGO_*.md` que
corresponda. Si los dos se contradicen, manda el encargo.*

---

## El circuito, en una línea

**GPT releva y escribe JSON en una carpeta local. Claude lo valida, lo monta y
lo commitea.** GPT no ve el repositorio, no toca git y no sube nada a ninguna
nube.

```
C:\Arte y Tierra\encargos-gpt\
├── LEEME.md                  ← esto mismo, para encontrarlo sin preguntar
├── reglas/                   ← copia de este archivo y del encargo que esté activo
└── entregas/
    ├── forraje/              ← una carpeta por encargo
    │   ├── 01.json           ← un archivo por lote, numerado
    │   └── 02.json
    ├── practicas-indomalaya/
    ├── fuentes-propias/
    └── licencias/
```

La carpeta está **afuera del repositorio** a propósito: `C:\Arte y Tierra\` es
la carpeta madre y el repo es `0. Claude`. Así nada que escriba GPT puede
terminar commiteado por accidente, y yo igual la leo.

## Lo que GPT no hace, y no es negociable

1. **No entra a GitHub.** Ni al repositorio, ni a los commits, ni a las ramas.
   No necesita nada de ahí: cada encargo viene con todo lo que hace falta
   escrito adentro.
2. **No se le suben archivos del proyecto.** Ni el código, ni los catálogos, ni
   los `.env`. Si un encargo necesita una lista de ids, la lista va escrita en
   el propio encargo.
3. **No trabaja en un Proyecto de ChatGPT ni con memoria prendida.** Un chat
   nuevo y suelto por encargo. Dos motivos: lo que queda en la memoria de un
   Proyecto se arrastra a todas las sesiones siguientes y encarece cada una, y
   el relevamiento no tiene por qué quedar guardado del otro lado.
4. **Conviene apagar «mejorar el modelo para todos»** en la configuración de
   datos de ChatGPT antes de arrancar. Es la única parte de «su nube» que
   realmente importa: la carpeta es local, pero la conversación no.
5. **No inventa una fuente.** Está abajo y es la regla que más costó.

## Lo que sí hace

Un **lote** por respuesta: un bloque de JSON, nada más. Sin resumen previo, sin
explicación posterior, sin repetir el encabezado del encargo. Ese bloque se
guarda como `entregas/<encargo>/NN.json` y se sigue con el lote siguiente.

El tamaño del lote lo fija cada encargo. Si un lote sale largo, se corta y se
sigue en el siguiente **sin repetir nada**.

## La regla de las fuentes, que es donde esto se arruina

**Una cita inventada es plausible, corta y pasa cualquier revisión.** Al armar
el catálogo de prácticas, un DOI escrito de memoria para el artículo de los
jardines de piedra de Rapa Nui resolvió a un artículo distinto de la misma
revista: el identificador existía y el trabajo era otro.

Por eso:

- **Ninguna URL entra sin abrirse primero.** Si no se puede abrir, no entra.
- El `label` se copia del título que muestra la página, no se redacta.
- Nada de DOI de memoria. Nada de "según la bibliografía". Nada de
  `et al. (2019)` sin el trabajo concreto.
- Si de una ficha no sale ninguna fuente que aguante, **se entrega vacía con el
  motivo**. Un hueco explicado vale; una afirmación sin respaldo cuesta meses de
  confianza. Veintidós fichas de este catálogo están vacías justamente así y
  están bien.
- Cada entrada lleva además una frase de `verificacion`: **qué dice la fuente,
  con sus palabras, en la página que se abrió.** Es lo que permite revisar el
  lote después sin volver a abrir todas las URLs.

## Las unidades y los rangos, cuando el encargo es un número

Esto no es una app que se estrelle: es una app que imprime un número plausible y
equivocado, y alguien excava una represa con eso. Todo número que se entregue
lleva:

- **unidad explícita** en el nombre del campo (`kg_ms_ha_anio`, no `forraje`);
- **el rango de validez**, con qué condiciones lo midió la fuente y dónde deja
  de valer;
- **qué devuelve fuera de rango**: `null` es una respuesta honesta, un número
  extrapolado no lo es.

Nunca se rellena un hueco con el promedio regional sin decirlo.

## Cómo se abarata, que es la mitad del pedido

La corrida anterior de este tipo de encargo se comió unos cien dólares de uso.
Lo que la encareció y acá no se repite:

- **No pedir contexto.** El encargo trae la lista de ids; GPT no pregunta "¿me
  pasás el archivo para ver el formato?". El formato está acá.
- **No devolver prosa.** Un bloque JSON por lote. Las explicaciones que hagan
  falta van en el campo `nota` de la entrada, no en el chat.
- **No releer lo entregado.** Cada lote es independiente. Si un lote ya se
  guardó, no se vuelve a mostrar ni a resumir.
- **Un chat por encargo, y se cierra al terminar.** Arrastrar veinte lotes en un
  mismo hilo significa pagar los veinte en cada respuesta nueva.
- **Lotes chicos.** Es más barato cortar y seguir que reintentar un lote largo
  que salió mal.

## La forma del JSON, igual para todos los encargos

```json
{
  "encargo": "forraje",
  "lote": 1,
  "fecha": "2026-10-11",
  "entradas": [
    {
      "id": "<el id que pide el encargo>",
      "...": "los campos que pide el encargo",
      "fuentes": [
        { "label": "Título tal como lo muestra la página", "url": "https://…" }
      ],
      "verificacion": "Qué dice esa página, con sus palabras.",
      "nota": "Opcional: la duda, el límite, o por qué esto quedó vacío."
    }
  ],
  "vacias": [
    { "id": "<id>", "motivo": "Qué se buscó y por qué no alcanzó." }
  ]
}
```

`entradas` y `vacias` pueden venir las dos; una entrada sin fuente verificable
va en `vacias` y no en `entradas`.

## Qué hago yo cuando llega

```bash
node _research/validar-entrega-gpt.mjs "C:/Arte y Tierra/encargos-gpt/entregas/forraje"
```

Chequea lo que un script puede chequear: que el JSON parsee, que no falte ningún
campo obligatorio, que ninguna entrada venga sin fuente, que las URLs tengan
forma de URL, que no haya ids repetidos entre lotes y que los ids existan en el
catálogo. **Lo que no puede chequear es si la fuente dice lo que la entrada
dice** —eso no lo prueba ningún test—, y para eso está el muestreo: abro al azar
una de cada diez y la leo. Si una no aguanta, el lote entero vuelve.

Después lo monto en el TypeScript, corro la compuerta y lo commiteo. Lo que GPT
entrega **nunca se commitea tal cual**.
