# Fase 6, lote 1 — Prácticas: la zona seca de Sri Lanka y las terrazas de Ifugao

*Veredicto del montaje. Entrega del 23/10/2026, montada el 24/10/2026.
Seis entradas pedidas, seis entregadas, ninguna a `vacias`.*

---

## 1. El veredicto, en una línea

**Las seis entradas son verdaderas y tres estaban en la ficha equivocada.**

Las tres URLs se abrieron y las tres dan 200. Todo lo que la entrega afirma está
en las páginas, incluidas las 226 especies de plantas de Palugaswewa y las más de
264 especies de árboles de Ifugao. Lo que falló no es la verdad de las entradas
sino **dónde van**: las tres de Ifugao colgaban de `luzon_montano`, y ahí no está
ni uno de los cinco conjuntos que inscribió la UNESCO.

---

## 2. El error es de polígono, y es el cuarto de la tanda

El razonamiento de la entrega es impecable en castellano: Ifugao es montaña y es
Luzón, entonces `luzon_montano`. Pero las fichas de acequia **no son
descripciones: son polígonos de RESOLVE**, y el ECO_ID 240 —*Luzon montane rain
forests*— es la Sierra Madre y los montes de Zambales. La propia ficha lo dice en
su resumen. Lo verifiqué contra el polígono:

| Punto | ECO_ID | Nombre |
|---|---|---|
| Palanan, Sierra Madre alta (17,05 N / 122,25 E) | 240 | Luzon montane rain forests |
| Monte Tapulao, Zambales (15,47 N / 120,12 E) | 240 | Luzon montane rain forests |

Es el **cuarto error del mismo tipo** en esta tanda de encargos: la MPKV con sus
distritos del oeste de Maharashtra en el lote 1 del Decán; Gorongosa, que está en
Mozambique y no en el miombo húmedo; Nyimba, que es miombo **seco**; y ahora
Ifugao. Los tres primeros eran de escala de país. Éste es adentro de una isla, que
es más fino, y por eso vale fijarlo con un test en vez de con un reto.

---

## 3. Dónde están de verdad

Los cinco conjuntos inscritos, consultados uno por uno contra RESOLVE:

| Conjunto inscrito | Coordenada | ECO_ID | Ficha |
|---|---|---|---|
| Nagacadan, Kiangan | 16,787 N / 121,065 E | **241** | `luzon_bajo` |
| Batad, Banaue | 16,931 N / 121,128 E | **241** | `luzon_bajo` |
| Bangaan, Banaue | 16,928 N / 121,120 E | **303** | `pinar_luzon` |
| Hungduan | 16,833 N / 120,900 E | **303** | `pinar_luzon` |
| Mayoyao | 16,983 N / 121,250 E | **303** | `pinar_luzon` |

Y el detalle que decidió el montaje: **el límite entre las dos ecorregiones parte
en dos al propio municipio de Banaue.** El pueblo (16,910 N / 121,058 E) da 241 y
el mirador de arriba (16,923 N / 121,062 E) da 303.

---

## 4. Por eso la práctica se montó dos veces, y es la primera vez

Es la primera práctica del catálogo que aparece en **dos fichas**. No es un
descuido y no es pereza de elegir: **acequia resuelve un punto, no una
provincia.** Un usuario parado en Banaue pueblo recibe `luzon_bajo` y uno parado
en Hungduan recibe `pinar_luzon`. Montar las terrazas en una sola de las dos
dejaría sin nada a la mitad de los predios que están literalmente sobre ellas.

Cada ficha nombra los conjuntos que caen en su polígono, así que los dos textos no
son copias: el de `luzon_bajo` cierra con Nagacadan y Batad, el de `pinar_luzon`
con Bangaan, Hungduan y Mayoyao. Y hay un test que falla si alguien las muda a
`luzon_montano` por parecido de nombre.

---

## 5. Sri Lanka sí estaba bien ubicada, y la ficha venía pidiéndolo

Palugaswewa —que es el sitio SIPAM, la división administrativa que la FAO nombra
como contraparte—, Habarana y la ciudad de Anuradhapura dan los tres **ECO_ID
301**, que es `sri_lanka_zona_seca`.

Y hay una continuidad que vale anotar. El campo `suelos` de esa ficha, escrito en
septiembre, ya terminaba así: *"Los reservorios antiguos que recorren la zona son
la infraestructura de cosecha de agua que responde a eso, y son el antecedente de
diseño más útil de la región."* **Esto es ese antecedente, fechado.** Hay un test
que verifica que la frase siga escrita, para que nadie la reescriba sin ver que
tenía una capa colgada.

---

## 6. Lo que se reescribió: la kattakaduwa es una de seis

La entrada de la kattakaduwa era la más floja de las seis, y el problema no era la
fuente sino el recorte. **La página de la FAO no le atribuye la sostenibilidad del
riego a esa franja sino a seis segmentos de uso del suelo, que nombra y traduce
uno por uno:**

| Nombre | Lo que la fuente dice que es |
|---|---|
| gas gommana | franja natural de árboles |
| perahana | prado de aguas arriba |
| potawetiya | lomo de tierra |
| **kattakaduwa** | **interceptor de filtraciones** |
| kiul ela | drenaje natural |
| thisbambe | amortiguador del caserío |

Montar una sola dejaba cinco sextos del mecanismo afuera. La entrada pasó a ser el
anillo completo, y **declara su propio límite**: la página los enumera y los
traduce pero no explica cómo funciona cada uno, así que lo que queda establecido es
la figura —alrededor de cada tanque hay un anillo de superficie que no se cultiva y
que la fuente cuenta como parte de la obra de riego— y no el detalle. Escribir el
mecanismo de cada franja habría sido inventarlo: los nombres sugieren la posición,
pero sugerir no es publicar.

Lo que sí es dato y queda: **226 especies de plantas** sólo en el kattakaduwa, el
terraplén del tanque y la franja arbolada de la cascada de Palugaswewa, y del
kattakaduwa salen plantas medicinales y material de junco y ratán. El anillo no es
superficie perdida.

---

## 7. Lo que no estaba pedido y es lo que más vale

Dos entradas nuevas, las dos de las mismas páginas que la entrega ya había
verificado. Estaban ahí y no se vieron.

### a. El pastoreo de la zona seca es el vaso del tanque (tipo `ganaderia`)

La FAO lo dice en una oración: *"The tank bed during dry season, the scrublands,
and the paddy fields during off-season, serve as grazing lands for the cattle and
buffalo."*

**O sea que acá la superficie de pastoreo no es una superficie aparte del predio:
es la misma que almacena el agua y la misma que produce el arroz**, usadas cuando
el agua se retiró y cuando el cultivo salió. Para acequia esto no es color: la app
calcula receptividad sobre la superficie del predio, y en este sistema la oferta de
pasto aparece cuando el tanque baja y desaparece cuando se llena. **El denominador
no lo fija el predio: lo fija el ciclo del tanque.** Es el único tipo `ganaderia`
de la ficha y la entrega no trajo ninguno.

### b. El bancal después de la cosecha: pinkol, inado y luhok (tipo `suelo`)

La FAO: *"Although rice production is done once a year, the terraces are busy the
whole year round. After the harvest season, vegetables are grown in organic mounds
(pinkol) and flat organic beds (inado) while fish are raised in fish holes (luhok)
built inside the terraces."*

Era el mejor contenido de diseño de la página y quedó afuera. Las tres son obras de
suelo **dentro del vaso que ya existe**: el montículo y la cama levantan el drenaje
y concentran materia orgánica sobre un fondo que estuvo inundado, y el hoyo guarda
agua y peces cuando la lámina se va. Es la respuesta a la pregunta que se le
aparece a cualquiera que diseña un arrozal en ladera: **qué hace esa superficie los
otros meses del año.**

---

## 8. Lo que le faltaba al muyung: el mecanismo

La entrada del muyung decía que las arboledas proveen madera y que el bosque de
cuenca "forma parte del conjunto que abastece de agua". La FAO es mucho más
específica y le asigna una función hidráulica explícita: por estar en el borde
superior que mira a los bancales, el bosque **regula el impacto de la lluvia
atrapando agua —dice que más que el bosque primario— y nutrientes del agua de
lluvia, y los suelta despacio hacia los bancales de abajo.**

Sin eso, el muyung se lee como un dato de biodiversidad. Con eso es parte del
riego, que es lo que cambia una decisión de diseño. La afirmación de que atrapa más
agua que el bosque primario es llamativa, así que va atribuida a la fuente y no
afirmada de frente.

---

## 9. Un sobregiro, chico, en una `verificacion`

La verificación de la entrada del muyung dice que UNESCO *"advierte que cambios en
su manejo afectan el suministro de agua y la erosión"*. La ficha 722 dice que el
cambio en el manejo de los bosques de cuenca **vuelve vulnerable al sistema**, y
menciona por separado la conservación de suelos entre los atributos y los arroyos
que se secan por cambio climático. No encadena las tres cosas. El texto montado
dice lo que la fuente dice, y el período de la entrada cita la advertencia tal como
está.

---

## 10. Una contradicción que no se tapa: se declara

El resumen de `luzon_bajo` dice que la ecorregión está *"por debajo de unos 1.000
m"* —que es la prosa de WWF— pero **el polígono de RESOLVE sube más que eso** y
alcanza bancales que la FAO ubica entre 800 y 1.500 m. Las dos cosas son ciertas:
la descripción de la ecorregión y su geometría no coinciden del todo, y acequia usa
la geometría.

La altura va escrita en el detalle para que el lector no tenga que resolver la
contradicción solo, y hay un test que fija las dos puntas: que el resumen siga
diciendo 1.000 m y que el detalle siga diciendo 800 a 1.500.

---

## 11. Cuatro entradas de una sola página

Las cuatro de Sri Lanka cuelgan de la misma URL. No viola ninguna regla del
encargo y la página aguanta las cuatro afirmaciones, pero el catálogo tiene 420
URLs sobre unos 123 dominios justamente para que ninguna ficha dependa de una sola
página: si esa página cambia de forma, se caen cuatro entradas juntas.

Para el lote que vuelva a la zona seca conviene una segunda fuente. Las dos rutas
naturales son el **Departamento de Agricultura de Sri Lanka** y el **IWMI**, que
tiene sede en Colombo y publica sobre rehabilitación de cascadas de tanques.

---

## 12. La tabla de correcciones

| Qué | De la entrega | Montado |
|---|---|---|
| Ficha de las tres de Ifugao | `luzon_montano` | `luzon_bajo` **y** `pinar_luzon` |
| Ficha de las tres de Sri Lanka | `sri_lanka_zona_seca` | sin cambio, verificada contra el polígono |
| Kattakaduwa | una franja | el anillo de seis franjas, con el límite de la fuente declarado |
| Período de la cascada | "Desde al menos el siglo III a.C." | lo que dice la fuente: el primer gran reservorio **registrado** es Abayawewa, del siglo III a.C. |
| Calendario | no estaba | dos temporadas, maha la mayor y yala la menor, sobre un solo régimen de lluvia |
| Muyung | madera y cuenca | la función hidráulica explícita, atribuida |
| Kurulu paluwa | sin límite declarado | se agrega que la fuente no publica qué fracción del lote se deja |
| Tipo `ganaderia` | ausente | el vaso del tanque y el rastrojo como tierra de pastoreo |
| Tipo `suelo` en Luzón | ausente | pinkol, inado y luhok |
| Altura de los bancales | ausente | 800 a 1.500 m, porque contradice el resumen del 241 |
| `label` de las fuentes | título de la página | con el editor adelante, como el resto del catálogo |

---

## 13. Las fuentes, verificadas una por una

| Fuente | Estado | Qué sostiene |
|---|---|---|
| FAO SIPAM — The Cascaded Tank-Village System in the Dry Zone of Sri Lanka | 200 | las cuatro entradas de Sri Lanka |
| FAO SIPAM — Ifugao Rice Terraces, Philippines | 200 | los cinco componentes, las 264 especies, el habal, el pinkol/inado/luhok, la función del bosque de arriba |
| UNESCO World Heritage Centre — Rice Terraces of the Philippine Cordilleras | 200 | los 2.000 años, los muros de piedra o barro, las parcelas con lámina, el riego desde las cumbres, los cinco conjuntos |

Ninguna de periodismo, ninguna de ResearchGate o Academia.edu, ninguna de un host
de pruebas, ninguna de enciclopedia colaborativa. El rótulo lleva el editor
adelante —`FAO SIPAM — …`, `UNESCO World Heritage Centre — …`— que es la convención
del catálogo, y hay un test que lo exige para este lote.

---

## 14. Lo que la página tenía y no entró, con su razón

Estas quedan nombradas para el lote que vuelva, no olvidadas:

- **El chena** (cultivo de roza de la zona seca) y la redistribución temporal de
  parcelas comunes en sequía. La FAO los menciona de paso; para una entrada hace
  falta el mecanismo, y para eso hay que ir al Departamento de Agricultura o al
  IWMI.
- **Las catorce variedades tradicionales de arroz** que la FAO lista por nombre
  (Suwandel, Kaluheenati, Pachchaperumal y once más). Es una entrada de `cultivo`
  legítima, pero sin ciclo ni requerimiento publicado sería un listado y no un
  mecanismo.
- **El control de plagas con hierbas y el calendario lunar de Ifugao**, que la
  UNESCO describe como *"a most complex pest control regime based on the processing
  of a variety of herbs"* y un sistema *"respecting lunar cycles"*. La ficha 722 no
  nombra ni una hierba ni una fecha, así que la entrada tendría título y no
  contenido. Ruta: PhilRice, PCAARRD.
- **El sismo como riesgo de diseño.** La UNESCO registra que terremotos
  desplazaron nacientes, movieron los diques de las terrazas y obligaron a
  redirigir la distribución de agua. No es una práctica, pero es exactamente el
  tipo de cosa que debería aparecer en un informe de acequia en zona sísmica, y hoy
  la app no tiene dónde ponerlo.

---

## 15. Qué quedó montado

- **`apps/terreno/lib/practicasHistoricas.ts`**: dos secciones nuevas, *Zona seca
  de Sri Lanka* y *Cordillera de Luzón*. Tres fichas que estaban en cero pasan a
  cuatro entradas cada una. El catálogo va de **408 entradas sobre 200 fichas** a
  **420 sobre 203**. El comentario de cada sección explica por qué la práctica está
  donde está, con los ECO_ID.
- **`apps/terreno/tests/unit/contexto/practicasIndomalaya.test.ts`**: 20 tests
  nuevos. Los que importan son los que fijan el polígono: que el 241 es
  `luzon_bajo`, que el 303 es `pinar_luzon`, que `luzon_montano` **sigue vacía**, y
  que cada ficha nombra sus propios conjuntos.
- El reparto del catálogo queda: 60 fichas con una entrada, 72 con dos, 68 con tres
  —el piso— y 3 con cuatro.

---

## 16. Pendientes que abre este lote

1. **`luzon_montano` sigue en cero y no se llena con Ifugao.** Lo que hay que
   buscar es el manejo de monte, la caza y la pesca documentados de la Sierra Madre
   y de Zambales.
2. **Una segunda fuente para la zona seca de Sri Lanka**, para que las cuatro
   entradas no cuelguen de una sola página.
3. **El sismo no tiene lugar en la app.** Una ecorregión puede traer un riesgo que
   no es clima ni suelo ni relieve, y hoy no hay campo donde escribirlo.
4. **`decan_central_hardwickia` no estaba en la lista de 32.** Se montó en octubre,
   después de escribirse el encargo, y nació sin prácticas. El bloque 1 son 30 y no
   29.

---

## 17. Qué se arregló en el encargo, y es el arreglo que importa

El error no se arregla pidiéndole a la entrega que adivine mejor el polígono,
porque no puede consultarlo. **Yo sí, y es una consulta de dos segundos.** Así que
cambió el reparto del trabajo:

> **El campo `id` pasa a ser una propuesta y se verifica al montar. Lo obligatorio
> es el campo `lugar`**: el sitio con el nombre que usa la fuente —municipio,
> distrito, provincia, valle— y la coordenada si la fuente o el registro de
> patrimonio la publica. Si la práctica está documentada en varios sitios, se
> nombran todos: eso es lo que hizo que las terrazas entren en dos fichas.

Y el corolario: **si el lugar no se puede decir, eso ya es el motivo para que la
entrada no entre.** Es el mismo filtro que dejó veintidós fichas vacías a
propósito.

Además: sección nueva al principio del encargo con el caso de Ifugao trabajado,
regla 11, el ejemplo de JSON con el campo `lugar`, el estado medido actualizado, y
la lista del bloque 1 en 30 ids.

---

## 18. Qué pedir en el lote 2

El bloque 1 sigue siendo lo primero y es donde hay más literatura. Las rutas
probadas son SIPAM de la FAO —que tiene sitios en India, Filipinas, Sri Lanka y
Bangladesh— y UNESCO.

Orden sugerido, y la razón de cada uno:

1. **`java_bali_montano` y `java_oriental_bali_bajo`, por el *subak*.** Es el
   siguiente sistema con ficha de patrimonio y es el caso perfecto para probar la
   regla nueva: Bali es chica, tiene dos fichas, y los templos de agua del subak se
   van a repartir entre las dos igual que Ifugao. Si la entrega entrega el `lugar`,
   el reparto lo hago yo sin fricción.
2. **`ghats_sur_deciduo`, por los *tanques* o *eri* del sur de la India.** Misma
   familia tecnológica que la cascada de Sri Lanka, con bibliografía propia, y
   encima la ficha es la del lote 3 de la fase 4: las dos capas se encuentran en la
   misma ecorregión.
3. **`valle_brahmaputra`, por el *apatani* y el *zabo*.** ICIMOD es la ruta y está
   nombrada en el encargo.
