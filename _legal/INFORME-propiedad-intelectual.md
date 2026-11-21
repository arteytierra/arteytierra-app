# Cómo se protege acequia

Informe y paso a paso. Titular: Jonatan Gabriel Palma, persona humana, 100 %.
Fecha: 24 de octubre de 2026; revisado el 21 de noviembre de 2026.
Versión de la obra preparada para depositar: la etiqueta `v1.1` de git.

---

## 1. La patente no va, y conviene saber por qué

El **art. 6 de la Ley 24.481** dice qué *no es* una invención. El inciso c)
excluye por nombre «los programas de computación». El inciso a) excluye «los
métodos matemáticos». Acequia cae en los dos: es un programa que aplica
métodos matemáticos. El INPI tiene además un anexo de sus Directrices de
Patentabilidad dedicado a programas de computación y es de las oficinas más
estrictas de la región: no admite la figura de «invención implementada por
computadora» que sí usan Europa y Estados Unidos.

Hay un segundo motivo, independiente del legal y más de fondo: **aunque el
software fuera patentable, no pasaría el requisito de novedad del art. 4.**
Todo lo que acequia calcula es literatura publicada, y lo es por diseño —el
contrato de los motores de cálculo exige fuente citada y un test contra un
caso resuelto de la literatura. Curve Number es USDA 1954. Hargreaves, 1985.
Köppen-Beck es un dataset publicado. Keyline es Yeomans. Eso es arte previo.

Lo nuevo de acequia no es ninguna fórmula: es la **integración** —resolver
cuarenta fuentes abiertas por coordenada y que salga un informe coherente— y
la ingeniería de haberlo hecho. Eso lo protege el derecho de autor.

Y un dato de tiempo ya jugado: en Europa la novedad es absoluta, sin período
de gracia. `app.acequia.app` está público. Aun si hubiera habido algo
patentable, la publicación ya quemó esa puerta.

**Entonces no se abre ningún expediente de patente.** Lo que sigue son los
dos trámites que sí corresponden, más lo que no se tramita y ya está hecho.

---

## 2. Qué se hace, cuánto cuesta, en qué orden

| | Trámite | Organismo | Costo | Estado |
|---|---|---|---|---|
| A | Depósito de obra inédita de software | DNDA | $1.400 | **Listo para presentar** |
| B | Marca «acequia», clase 42 | INPI | pagado | **Concedida el 30/10/2026** |
| C | Aviso de copyright y reserva en el repo | — | $0 | **Hecho** |
| D | Secreto comercial (Ley 24.766) | — | $0 | **Hecho en parte** |

**B ya está.** No una marca sino dos: la denominativa «ACEQUIA» (registro
N.º 3.978.600) y la mixta (registro N.º 3.976.649), las dos en clase 42,
concedidas el 30 de octubre de 2026 y vigentes hasta el 30 de octubre de 2036.
El detalle, los vencimientos y la declaración jurada de uso están en el
Anexo II de `_legal/licencia-software-y-marca.md`.

Queda **A**, que no corre ninguna carrera pero cuesta $1.400 y lleva una
tarde, y es el único de los cuatro que todavía depende de que vos salgas a
hacer algo.

---

## 3. Trámite A — Depósito en custodia en la DNDA

Protege el **código fuente** con fecha cierta del Estado. Dura 3 años,
renovable por 3 más dentro de los 30 días **posteriores** al vencimiento. Si
no se renueva, se destruye (Decreto 972/2024).

Todo lo que sigue —arancel, datos bancarios, requisitos del sobre,
direcciones— lo releí el **21 de noviembre de 2026** en las dos páginas
oficiales, que son las que explican el trámite completo:

- **La ficha del trámite**, que es la que hay que leer:
  <https://www.argentina.gob.ar/servicio/deposito-en-custodia-de-obra-inedita-software>
- **El listado de receptorías del interior**:
  <https://www.argentina.gob.ar/justicia/derechodeautor/receptorias>

### Lo que ya está armado

Hay **dos versiones del soporte** preparadas, cada una en su carpeta de
`_legal/deposito/` (esa carpeta está fuera de git: no se commitea nada de
esto). Depositás una sola:

| Carpeta | Cuál es | Commit | Archivos | Fecha de la versión |
|---|---|---|---|---|
| `v1.1/` | **la que recomiendo** | `4a28534`, etiqueta `v1.1` | 1.690 | 21/11/2026 |
| raíz | la de octubre | `7d975f8`, etiqueta `v1.0` | 1.570 | 24/10/2026 |

Entre una y otra hay **87 commits**: entre ellos toda la obra legal de esta
semana —la página de arrepentimiento, la identificación del proveedor, los
registros de marca en los Términos— y el cálculo del cauce y el desagüe. El
depósito dura tres años y protege *la versión que depositás*, así que conviene
que sea la más completa. La de octubre queda ahí por si preferís la fecha de
versión más vieja; no la borres hasta que el trámite esté cerrado.

Cada carpeta tiene los mismos cuatro archivos, y son los cuatro que van al
pendrive, nada más:

| Archivo | Qué es |
|---|---|
| `acequia-fuente-v1.1.tar.gz` | 33 MB. El código fuente completo de la obra. |
| `MANIFIESTO-v1.1.txt` | SHA-256 de cada uno de los 1.690 archivos, más el del tarball y las exclusiones declaradas. |
| `DECLARACION-DE-AUTORIA.txt` | Declaración de autoría y titularidad. **Completa: no le falta ningún dato.** |
| `LEEME-SOPORTE.txt` | Qué hay en el pendrive, para quien lo abra. |

El SHA-256 del tarball está escrito en tres lugares del soporte —el
`MANIFIESTO`, el `LEEME-SOPORTE` y la `DECLARACION`— y verifiqué que los tres
coinciden entre sí y con el archivo. Ese es el número que te deja probar,
dentro de tres o de diez años, que el archivo que se abre es exactamente el
que depositaste. No lo copio acá para que no queden dos versiones del dato: el
que vale es el del soporte.

En la v1.1 el comprimido es, byte por byte, el árbol del commit `4a28534`, y
cada hash del inventario corresponde al archivo **tal como está adentro del
`.tar.gz`**. Lo verifiqué extrayendo el comprimido y recalculando los 1.690
hashes: los 1.690 dan. Eso quiere decir que cualquiera puede repetir la
verificación sin acceso al repositorio.

**Qué dejé afuera del depósito, y por qué.** Dos cosas, ambas declaradas en el
MANIFIESTO para que el depósito sea internamente honesto:

- `supabase/1/` — el binario de la CLI de Supabase. **Son 123 MB de software
  de terceros bajo licencia MIT, Copyright (c) 2021 Supabase, Inc., que están
  commiteados en el repo.** Depositarlo sería presentar obra ajena como
  propia. (Aparte: eso también habría que sacarlo del repo. Ver §7.)
- `apps/web/public/` — las fotos y el video **ya publicados** en
  arteytierra.org. No son software y no son inéditos; meterlos en un depósito
  de «obra inédita» es contradecir la declaración.

**Y una cosa de terceros que sí entra, declarada como tal.** Los tres GeoTIFF
de `apps/terreno/datos/koppen/` —el mapa climático Köppen-Geiger de 1 km,
35 MB— están adentro del depósito, porque la app los lee del disco y sin ellos
el código no se entiende completo. Son de Beck y otros, *Scientific Data* 10,
724 (2023), bajo **CC BY 4.0**, que autoriza expresamente redistribuirlos y
usarlos comercialmente con atribución. La declaración los identifica uno por
uno, dice que no son obra tuya, y el punto 5 reserva la salvedad: jurás ser
autor único *con excepción* de lo listado en el punto 4. Sin esa aclaración
estarías declarando como propio un mapa que no lo es.

### Paso a paso

**1. Elegí la versión**
`v1.1`, salvo que quieras la otra. Los cuatro archivos que vas a copiar son
los de `_legal/deposito/v1.1/`. No hay nada que completar en ninguno: la
declaración ya tiene tu CUIT, estado civil, domicilio y teléfono cargados
desde el 29 de octubre.

**2. Pagá el arancel: $1.400**
La ficha oficial dice «$1400.00 — Tasa incluida». Depósito o transferencia a:

```
Beneficiario : Fondo Cooperador Ley 23.412 DNDA-CESSI
CUIT         : 30-65309254-3
Alias        : CAMARACESSI
CBU          : 0140019901401901247953
Banco        : Provincia de Buenos Aires, cuenta corriente 12479/5
Importe      : $1.400
```

Guardá el comprobante en PDF o imagen: se sube en el paso 4. El monto lo
confirmé hoy en la ficha oficial, que no publica fecha de vigencia del
arancel; si pasan meses hasta que lo hagas, volvé a mirarlo antes de
transferir.

**3. Grabá el pendrive**
Copiá los cuatro archivos de `_legal/deposito/v1.1/` a un pendrive. Nada más:
sólo esos cuatro. La ficha acepta «cualquier soporte» y da como ejemplos CD,
DVD o pendrive, así que el pendrive sirve.

**4. Iniciá el expediente en TAD**
Entrá a `tramitesadistancia.gob.ar` con tu Clave Fiscal de AFIP y buscá
**«Depósito en custodia de obra inédita software»** (es el trámite id 534).
Subí el comprobante de pago y cargá los datos.

Los datos que pide por cada autor o titular son exactamente estos, y **los
tenés todos en el punto 1 de la `DECLARACION-DE-AUTORIA.txt`**, que es el
archivo que no se versiona justamente porque lleva tus datos personales:
nombre completo, CUIL, nacionalidad, estado civil, correo, teléfono,
domicilio y porcentaje de titularidad —100 %—. Copialos de ahí y no los
tipees de memoria: tienen que coincidir con la hoja que firmás.
El sistema te devuelve un **número de Expediente Electrónico** y **dos
carátulas** en PDF: la **carátula de expediente** y la **carátula variable**.
Son dos hojas que genera el propio TAD con el número de expediente, tus datos
y el trámite; no las escribís vos, se descargan y se imprimen. Imprimí las
dos: son las que la DNDA usa para encontrar tu expediente electrónico cuando
le llega el sobre, y por eso van **por fuera**, pegadas o engrapadas al sobre
cerrado, nunca adentro. Si van adentro, el sobre llega sin identificación y no
se puede vincular al expediente.

**5. Armá el sobre**
Sobre de **papel madera, tamaño A4 como mínimo**. Adentro: el pendrive y la
hoja de la declaración de autoría firmada de puño y letra —antes de cerrar,
completá a mano «Lugar y fecha» y firmá al pie, sobre la aclaración—.

Cerralo y **firmá sobre los puntos de cierre**: la ficha lo pide
expresamente, la firma tiene que cruzar el pegado y es lo que prueba que el
sobre no se abrió.

Por fuera va, textual de la ficha, «título y nombre completo de el/los
autores, el/los coordinadores y/o los titulares». O sea dos cosas:

```
acequia  (v1.1)
Jonatan Gabriel Palma
```

**El título de la obra es «acequia», no «Arte y Tierra».** Arte y Tierra es el
nombre de tu estudio: no es autor, no es titular y no es una persona jurídica.
El autor y titular sos vos, persona humana, al 100 %. Corregí esto en los tres
archivos del soporte el 21/11/2026: donde decía «Arte y Tierra - plataforma
acequia» ahora dice `Titulo: acequia`, con el subtítulo «plataforma de
análisis de territorio y diseño regenerativo» y la aclaración de que el
soporte lleva el monorepo entero —acequia más arteytierra.org—, del mismo
autor. Eso último conviene que esté dicho: en el pendrive viaja también el
código del sitio del estudio, y el depósito tiene que describir lo que
realmente contiene.

Y por fuera, además, las **dos carátulas** del paso 4.

**6. Presentalo**
- **En persona, en CABA:** Moreno 1230, mesa de entradas, lunes a viernes de
  9:30 a 14:30. Puede ir cualquier persona, no hace falta que vayas vos.
- **Por correo, que es lo tuyo:** el sobre de papel madera cerrado **más las
  dos carátulas** se meten dentro de **otro sobre**, y ese segundo sobre se
  despacha a:

  ```
  Direccion Nacional del Derecho de Autor
  Moreno 1228
  C1091AAZ - Ciudad Autonoma de Buenos Aires
  ```

  (La ficha da 1230 para la presentación personal y 1228 para el correo
  postal; así figura, no es un error de transcripción mío.) Mandalo con
  seguimiento y guardá el número: es tu prueba de despacho.

- **Desde Córdoba, lo que hay de cerca.** La DNDA tiene receptorías en el
  interior, pero en la provincia de Córdoba el listado oficial muestra **una
  sola**, y no está en la capital: el **Instituto de Extensión de la
  Universidad Nacional de Villa María** —Oficina de Propiedad Intelectual,
  Santiago del Estero 1365, Villa María, tel. (0353) 453-9116,
  agiordano@unvm.edu.ar—. **Ojo con esa entrada:** otras receptorías del
  listado dicen «Tramita obra inédita no musical» y ésta dice sólo «Brinda
  asesoramiento general». O sea que **no está claro que reciba el depósito**;
  habría que llamar y preguntar antes de manejar las dos horas y media desde
  San Marcos. Desde San Marcos Sierras, salvo que por teléfono te confirmen
  que Villa María lo recibe, **el camino práctico es el correo postal**: te
  ahorra el viaje y el trámite es el mismo.
- Consultas en la DNDA: (+54 11) 4124-7200.

**7. Esperá la constancia**
Si hay un error te mandan una tarea de subsanación por TAD. Si no, te dan la
**constancia de depósito en custodia**, también por TAD. Guardala.

**8. Anotá el vencimiento**
Tres años desde el depósito. La renovación es dentro de los **30 días
posteriores** al vencimiento, ni antes ni después. Poné la alarma el día que
recibas la constancia: si se pasa el plazo, lo depositado se destruye.

### Para llevar en la mano

- [ ] Comprobante de la transferencia de $1.400 (PDF o foto)
- [ ] Pendrive con los **cuatro** archivos de `_legal/deposito/v1.1/`
- [ ] La declaración impresa, con lugar, fecha y firma de puño y letra
- [ ] Las dos carátulas de TAD impresas (las genera TAD en el paso 4)
- [ ] Sobre de papel madera A4, cerrado, firmado cruzando el cierre, con «acequia (v1.1)» y «Jonatan Gabriel Palma» escritos por fuera
- [ ] Las dos carátulas **por fuera** del sobre, no adentro

### Lo que este depósito sí y no hace

Prueba **esa versión** en **esa fecha**. Es una foto de un código que cambia
todas las semanas. Lo que te da es una fecha sellada por el Estado, que es
difícil de discutir. La prueba continua y gratis ya la tenés y es fuerte: 759
commits desde el 17 de mayo de 2026 en un repositorio privado de GitHub, las
etiquetas `v1.0` y `v1.1` publicadas en el remoto, y el log de deployments de
Vercel. El depósito no reemplaza eso: lo corona.

---

## 4. Trámite B — Marca «acequia» en el INPI: concedida

Esto era lo que de verdad te podían sacar, y lo único que tiene valor
comercial transferible. **Ya está hecho y aprobado, a tu nombre como persona
humana.** El 30 de octubre de 2026 el INPI concedió **dos registros**, no uno:

| Marca | Registro | Acta | Título |
|---|---|---|---|
| **Denominativa** — «ACEQUIA» | 3.978.600 | 4.776.908 | 5 de noviembre de 2026 |
| **Mixta** — isologotipo + «acequia» | 3.976.649 | 4.776.907 | 4 de noviembre de 2026 |

Las dos en **clase 42**, vigentes hasta el **30 de octubre de 2036**. Tener la
denominativa además de la mixta es mejor de lo que yo había recomendado acá en
octubre: la palabra sola protege el nombre independientemente del logo.

Los dos títulos en PDF están en `C:\Arte y Tierra\Acequia\registro de marca`.
El detalle completo —servicios protegidos, disposición, y los dos
vencimientos que hay que anotar— está en el **Anexo II** de
`_legal/licencia-software-y-marca.md`.

### Lo único que queda de este trámite son dos fechas

- **Declaración jurada de uso de medio término** (art. 26 de la Ley 22.362,
  texto del DNU 27/2018): entre el **30 de octubre de 2031** y el **30 de
  octubre de 2032**, una por registro. Si no se presenta, la marca cae.
- **Renovación**: 2036, y hay que acreditar uso en los cinco años anteriores.

### Lo que queda sin registrar

- **«Arte y Tierra»** sigue sin registrar. Es tu marca de estudio y es otro
  trámite completo, con su arancel por clase. Ahora que acequia está cubierta,
  es la siguiente candidata si querés gastar en esto.
- **Clase 9** (software como producto) no se pidió: las dos marcas son de
  clase 42 (servicios, que es lo que acequia presta como SaaS). Si algún día
  vendés el software empaquetado, ahí sí hace falta.

---

## 5. Lo que no se tramita y ya está hecho

**El derecho de autor ya lo tenés.** La Ley 11.723, reformada por la Ley
25.036 de 1998, incluye en su art. 1 «los programas de computación fuente y
objeto». La protección nace con la obra, sin registro y sin trámite. El
depósito del §3 no te da el derecho: te da la prueba de la fecha.

**Aviso de copyright en el repo.** Escribí `LICENSE` en la raíz: titularidad
exclusiva, reserva de todos los derechos, aclaración de que el acceso al
repositorio no transfiere nada, y la mención de la Ley 24.766 sobre la
información confidencial. Faltaba por completo: el repo no tenía ningún aviso.

**Secreto comercial, Ley 24.766.** Las constantes de calibración, los
umbrales, las tablas de forraje y la combinación de fuentes son información
no divulgada. No se registra: lo único que la ley exige es haber tomado
**medidas razonables de reserva**. El repo privado, las claves fuera de git y
ahora el aviso en `LICENSE` son esas medidas. Lo que falta: si en algún
momento le das acceso al repo a alguien que no seas vos, que firme un acuerdo
de confidencialidad antes. Te lo redacto cuando haga falta.

---

## 6. Dos cosas que tenés que saber antes de firmar

**La declaración de la DNDA es una declaración jurada.** La firmás vos.

**En el historial de git figura Claude.** Dos niveles:

- **667 commits** tienen el trailer `Co-Authored-By: Claude`.
- **24 commits** tienen a `Claude <noreply@anthropic.com>` como **autor** del
  commit, no sólo como co-autor.

Esto no te quita la titularidad. Soy una herramienta, los términos de
Anthropic te asignan los derechos del output, y el criterio que se viene
sosteniendo es que el código asistido por IA donde la persona dirige, decide
y elige es obra de esa persona. Pero está escrito en el repositorio y es
visible. Si algún día un conflicto llega a instancia probatoria, va a estar
ahí y te lo van a preguntar. Preferís saberlo ahora.

---

## 7. Aparte: 123 MB de software ajeno commiteados

En `supabase/1/` hay `supabase.exe` y su `.tar.gz`: la CLI de Supabase, 123 MB,
software de terceros bajo licencia MIT. No debería estar versionado —es una
herramienta que se descarga, no código del proyecto— y explica buena parte del
peso del `.git`.

Lo dejé afuera del depósito. Sacarlo del repo es otra conversación: quitarlo
del HEAD es un commit trivial, pero para recuperar los 123 MB del historial
hay que reescribirlo, y eso toca una historia compartida con las otras
sesiones. Decime y lo encaro con cuidado.

---

## Fuentes

- [Ley 24.481 de Patentes, texto actualizado](https://www.argentina.gob.ar/normativa/nacional/35001/actualizacion)
- [Art. 6(c) y Anexo III de las Directrices de Patentabilidad del INPI (OMPI)](https://wipo.int/ip-development/en/agenda/flexibilities/details.jsp?id=8778)
- [Depósito en custodia de obra inédita software — ficha oficial del trámite, releída el 21/11/2026](https://www.argentina.gob.ar/servicio/deposito-en-custodia-de-obra-inedita-software)
- [Receptorías en el interior del país — DNDA, releída el 21/11/2026](https://www.argentina.gob.ar/justicia/derechodeautor/receptorias)
- [Depósito en custodia de obra inédita de software — DNDA](https://www.argentina.gob.ar/registrar-la-autoria-de-un-software-inedito)
- [Registrar software puesto en conocimiento público — DNDA](https://www.argentina.gob.ar/registrar-la-autoria-de-un-software-inedito-0)
- [Resolución INPI 75/2026 — creación de la UMAPI](https://abogados.com.ar/la-unidad-de-medida-arancelaria-de-la-propiedad-industrial-umapi-resolucion-inpi-752026/38789)
- [Aumento de tasas del INPI desde abril de 2026](https://abogados.com.ar/aumento-significativo-de-las-tasas-oficiales-del-inpi-a-partir-del-1-de-abril-de-2026/38803)
