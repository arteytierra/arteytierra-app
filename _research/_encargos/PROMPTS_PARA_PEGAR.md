# Los prompts para GPT, listos para pegar

*Al 02/11/2026. Un chat nuevo y suelto por encargo: sin Proyecto, sin memoria,
sin conectores, sin el de GitHub, y con «mejorar el modelo para todos» apagado.
Cada encargo se cierra al terminar — arrastrar veinte lotes en un mismo hilo
significa pagar los veinte en cada respuesta nueva.*

**Siempre dos pegadas, en este orden:**

1. `reglas\GPT_LOCAL_REGLAS.md` completo.
2. el `reglas\ENCARGO_*.md` de la fila que corresponda.

Y nada más: no hace falta escribir ninguna instrucción propia. Si los dos
archivos se contradicen, manda el encargo, y eso ya está dicho adentro.

---

## Por orden de lo que destraba

| # | Segunda pegada | Qué destraba | Dónde cae |
|---|---|---|---|
| **1** | `ENCARGO_FORRAJE_YP.md` | **Reescrito el 02/11/2026: es otro pedido.** La primera vuelta cerró el barrido bibliográfico —la columna de las fichas del NRCS no es `Yp`, y el `Yp` se despeja de la Tabla 1 con 0,02 % de error—. Ahora son **tres blancos con nombre**: Wight y Black (1979), la ficha del sitio real de Sidney (MLRA 52 / RRU 52N) y la relación entre rendimiento potencial y suelo, que es la que vale. | `entregas\yp\04.json` … `06.json` |
| **2** | `ENCARGO_FASE_6_LOTES_08_10.md` | Prácticas fechadas del territorio. Siete lotes entregados, van los tres últimos. | `entregas\practicas\08.json` … `10.json` |
| **3** | `ENCARGO_FASE_4_LOTES_04_06.md` | Fichas de Indomalaya. | `entregas\fichas-indomalaya\04.json` … `06.json` |
| **4** | `ENCARGO_FASE_4_LOTE_02.md` | Indomalaya lote 2. **Nunca volvió**: es un reintento, no un pedido nuevo. | `entregas\fichas-indomalaya\02.json` |
| **5** | `ENCARGO_FASE_4_LOTE_03.md` | Indomalaya lote 3. También nunca volvió. | `entregas\fichas-indomalaya\03.json` |
| **6** | `ENCARGO_FASE_3_LOTE_02.md` | Fichas de Australasia. | `entregas\fichas-australasia\02.json` |
| **7** | `ENCARGO_FASE_5_LOTE_02.md` | Fichas de África. | `entregas\fichas-africa\02.json` |

Los cuatro y cinco pueden ir en el mismo chat que el tres, porque son el mismo
encargo y la misma carpeta: se pegan las reglas una vez, y después los tres
archivos de encargo seguidos. Los demás, uno por chat.

---

## El de `Yp`, que cambió de pedido, en una frase

**`Y = Yp · T/Tp`**. La fracción `T/Tp` ya la calcula acequia con balance diario,
y `Yp` es cuánto produce el sitio cuando el agua no es lo que limita.

La primera vuelta de este encargo **ya se hizo y cerró dos cosas**. Una: la
columna alta de las fichas de sitio ecológico del NRCS, que era la mejor
candidata, **no es `Yp`** —lee 1,6 a 2,0 veces alto contra el único `Yp` con el
que se puede comparar, porque cuenta hierbas y arbustos, mide producción anual y
no pico de materia en pie, y encima la ficha nunca dice que esa columna sea de un
año favorable—. Dos, y mejor: **`Yp` se despeja**, con `Yp = Y·Tp/T`, y eso quedó
verificado contra la propia tabla del trabajo con un error del 0,02 %. Como el
despeje no arrastra la sequía de la temporada medida, alcanza **un corte de pasto
en el predio del usuario**.

Así que lo que se le pide ahora a GPT son **tres blancos con nombre**, no un
barrido: el trabajo de Wight y Black (1979) de donde salió el 1.300, la ficha del
sitio real de Sidney —que está en la MLRA 52, no en la que se relevó—, y la
relación entre rendimiento potencial y una propiedad de suelo, que sigue siendo
lo que más vale y ahora tiene con qué validarse. Si alguno no existe, que lo
diga: eso también cierra una pregunta.

---

## Lo que queda abierto y todavía no tiene encargo escrito

No pegarlos todavía; están acá para que no se pierdan.

- **Fase 1, licencias y vías.** Bloque A preguntas 4, 5 y 6; bloque B las cinco;
  bloque C los 81 saberes sin geometría.
- **Fase 2, los ocho números sin fuente.** Un lote entregado.
- **Fase 5, África después del 42.** Veintiséis ecorregiones en cola (65, 34, 66,
  64, 38, 48, 47, 40, 41, 53, 43, 62, 44, 52, 58, 63, 61, 51, 57, 55, 54, 50, 45,
  35, 49, 46) más la 37 y la 60, que van a `vacias`.
- **Fase 3, Australasia después del 216.** Nueve: 191, 207, 212, 215, 209, 210,
  211, 208, 214.
- **Fase 6, bloques 2 y 3.**
- **Cuatro entradas de prácticas de Indomalaya** que volvieron y necesitan fuente
  de reemplazo.

---

## Cuando algo cae en `entregas\`

```bash
node _research/validar-entrega-gpt.mjs "C:/Arte y Tierra/encargos-gpt/entregas/yp"
```

Chequea la forma —campos obligatorios, URLs, ids repetidos, ids que no existen
en el catálogo— y abre **una de cada diez** para leer la fuente. Si una no
aguanta vuelve el lote entero, porque el problema es el método y no la entrada.
Lo que GPT entrega nunca se commitea tal cual.
