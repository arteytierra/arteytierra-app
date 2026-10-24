# Cómo se protege acequia

Informe y paso a paso. Titular: Jonatan Gabriel Palma, persona humana, 100 %.
Fecha: 24 de octubre de 2026. Versión de la obra: `v1.0` (commit `0ede01d`).

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

| | Trámite | Organismo | Costo | Prioridad |
|---|---|---|---|---|
| A | Depósito de obra inédita de software | DNDA | $1.400 | Hacelo ya |
| B | Marca mixta «acequia», clases 9 y 42 | INPI | ~100 UMAPI por clase | Hacelo ya |
| C | Aviso de copyright y reserva en el repo | — | $0 | **Hecho** |
| D | Secreto comercial (Ley 24.766) | — | $0 | **Hecho en parte** |

El orden importa en **B**: la marca en Argentina es por orden de llegada. El
que la pide primero la tiene. El depósito **A** no corre esa carrera, pero
cuesta $1.400 y lleva una tarde.

---

## 3. Trámite A — Depósito en custodia en la DNDA

Protege el **código fuente** con fecha cierta del Estado. Dura 3 años,
renovable por 3 más dentro de los 30 días del vencimiento. Si no se renueva,
se destruye (Decreto 972/2024).

### Lo que ya está armado

En `_legal/deposito/` (fuera de git, no se commitea) hay cuatro archivos:

| Archivo | Qué es |
|---|---|
| `acequia-fuente-v1.0.tar.gz` | 32 MB. 1.535 archivos de código fuente. |
| `MANIFIESTO-v1.0.txt` | SHA-256 de cada archivo, uno por uno, más el del tarball y las exclusiones declaradas. |
| `DECLARACION-DE-AUTORIA.txt` | Declaración de autoría y titularidad. **Tiene cuatro campos por completar.** |
| `LEEME-SOPORTE.txt` | Qué hay en el pendrive, para quien lo abra. |

SHA-256 del tarball:
`c871148ec245624941854af917198d5b993e946dbd6aab75f06ac1416a9a6bb8`

**Qué dejé afuera del depósito, y por qué.** Dos cosas, ambas declaradas en
el MANIFIESTO para que el depósito sea internamente honesto:

- `supabase/1/` — el binario de la CLI de Supabase. **Son 123 MB de software
  de terceros bajo licencia MIT, Copyright (c) 2021 Supabase, Inc., que están
  commiteados en el repo.** Depositarlo sería presentar obra ajena como
  propia. (Aparte: eso también habría que sacarlo del repo. Ver §7.)
- `apps/web/public/` — 217 MB de fotos y video **ya publicados** en
  arteytierra.org. No son software y no son inéditos; meterlos en un depósito
  de «obra inédita» es contradecir la declaración.

Lo que quedó son 1.535 archivos, 232.000 líneas de TypeScript, SQL y CSS, y
las 63 migraciones de la base.

### Paso a paso

**1. Completá los campos de `DECLARACION-DE-AUTORIA.txt`**
CUIT/CUIL, estado civil, domicilio real y teléfono. Están marcados
`[COMPLETAR]`. Si me los pasás lo completo yo y te lo dejo listo para firmar.

**2. Pagá el arancel: $1.400**
Depósito o transferencia a:

```
Beneficiario : Fondo Cooperador Ley 23.412 DNDA-CESSI
CUIT         : 30-65309254-3
Alias        : CAMARACESSI
CBU          : 0140019901401901247953
Banco        : Provincia de Buenos Aires, cuenta corriente 12479/5
Importe      : $1.400
```

Guardá el comprobante en PDF o imagen. Confirmá el importe en la página
oficial del trámite antes de transferir: lo actualizan sin aviso.

**3. Grabá el pendrive**
Copiá los cuatro archivos de `_legal/deposito/` a un pendrive (o quemá un CD
o DVD, los tres sirven). Nada más: sólo esos cuatro.

**4. Iniciá el expediente en TAD**
Entrá a `tramitesadistancia.gob.ar` con tu Clave Fiscal de AFIP y buscá
**«Depósito en custodia de obra inédita software»**. Subí el comprobante de
pago y cargá los datos del autor y titular (los mismos de la declaración,
100 % de titularidad).

El sistema te devuelve un **número de Expediente Electrónico** y **dos
carátulas** en PDF: la de expediente y la variable. Imprimí las dos.

**5. Armá el sobre**
Sobre de **papel madera, tamaño A4 como mínimo**. Adentro: el pendrive y la
hoja de la declaración de autoría firmada de puño y letra. Cerralo y
**firmá sobre los puntos de cierre** —la firma tiene que cruzar el pegado, es
lo que prueba que no se abrió. Escribí por fuera el título de la obra y tu
nombre completo. Pegá por fuera las dos carátulas.

**6. Presentalo**
- En persona: Moreno 1230, CABA, lunes a viernes de 9:30 a 14:30. Puede ir
  cualquier persona, no hace falta que vayas vos.
- Por correo: DNDA, Moreno 1228, C1091AAZ, CABA. El sobre con la obra y las
  carátulas van dentro de otro sobre.
- Desde el interior: por las receptorías, el listado está en el sitio.

**7. Esperá la constancia**
Si hay un error te mandan una tarea de subsanación por TAD. Si no, te dan la
**constancia de depósito en custodia**, también por TAD. Guardala.

**8. Anotá el vencimiento**
Tres años desde el depósito. La renovación es dentro de los **30 días
posteriores** al vencimiento, ni antes ni después. Poné la alarma el día que
recibas la constancia.

### Lo que este depósito sí y no hace

Prueba **esa versión** en **esa fecha**. Es una foto de un código que cambia
todas las semanas. Lo que te da es una fecha sellada por el Estado, que es
difícil de discutir. La prueba continua y gratis ya la tenés y es fuerte: 653
commits desde el 17 de mayo de 2026 en un repositorio privado de GitHub, más
el log de deployments de Vercel. El depósito no reemplaza eso: lo corona.

---

## 4. Trámite B — Marca «acequia» en el INPI

Esto es lo que de verdad te pueden sacar, y lo único que tiene valor
comercial transferible. Va a tu nombre como persona humana.

**Marca mixta** (isotipo + palabra), clases **9** (software) y **42**
(SaaS y servicios técnicos). El arancel es de **100 UMAPI por clase** para
hasta 20 productos o servicios.

> **Sobre el costo.** La UMAPI se creó por Resolución INPI 75/2026 y arrancó
> en $360, o sea $36.000 por clase. Pero **se actualiza todos los meses por
> IPC del INDEC**, así que a octubre de 2026 el número es otro y hay que
> leerlo en el portal del INPI antes de pagar. Las notas periodísticas de
> este año dan cifras que difieren entre sí por un factor de seis: no te
> guíes por ellas.

### Lo que ya está armado

- `_legal/marca/acequia-marca-mixta.jpg` — el logo sobre fondo blanco,
  1400 x 600 px, listo para subir.
- `_legal/marca/SOLICITUD-MARCA-acequia.md` — las listas de productos y
  servicios de las clases 9 y 42, redactadas y para copiar y pegar, más una
  clase 44 opcional.

### Paso a paso

**1. Buscá antecedentes antes de pagar**
En el buscador de marcas del INPI, clases 9 y 42: `acequia` exacta, `acequia`
dentro de otro signo, y los parecidos fonéticos (`azequia`, `asequia`,
`acekia`). Si aparece algo idéntico o confundible vigente, se replantea antes
de pagar, no después. Busqué por fuera del padrón y no encontré nada, pero
**eso no es una búsqueda en el padrón** y no alcanza. Si querés te la hago
con el navegador; si salta un captcha lo tenés que pasar vos.

**2. Verificá la redacción contra la Clasificación de Niza**
Rige la **13ª edición, versión 2026** desde el 01/01/2026. El INPI manda a
subsanar los términos que no figuran tal cual en la lista oficial. Pegá las
dos listas en el clasificador del propio INPI y confirmá cada término. Si uno
no aparece, reemplazalo por el oficial más cercano en vez de inventar.

**3. Presentá la solicitud**
Portal de trámites del INPI, con Clave Fiscal. Solicitante: vos, persona
humana. Tipo: mixta. Subí el JPG. Pegá la lista de la clase 9 en una
solicitud y la de la clase 42 en otra: **son dos solicitudes y dos aranceles,
no una sola con dos clases.**

**4. Pagá los dos aranceles**

**5. Publicación y oposiciones**
El INPI publica la solicitud en el Boletín de Marcas. Desde la publicación
corren **30 días** para que un tercero se oponga. Si nadie se opone, sigue el
examen de fondo. Si alguien se opone, te llega la notificación y hay un plazo
para contestar: ahí sí conviene un agente de la propiedad industrial.

**6. Concesión**
Si sale, la marca dura **10 años** desde la concesión, renovable
indefinidamente por períodos de 10. En la renovación hay que declarar que se
usó la marca.

### Dos cosas que decidir

- **¿«Arte y Tierra» también?** Es tu marca de estudio y no está registrada.
  Es otro trámite completo, con su arancel por clase. Si el presupuesto da
  para una sola ahora, acequia es la urgente: es la que tiene un producto
  vendiendo suscripciones y un dominio.
- **¿La palabra sola, además de la mixta?** Da protección más amplia pero es
  más objetable y es otra solicitud por clase. Mi recomendación: arrancá con
  la mixta. Si prende el producto, después sumás la denominativa.

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

- **566 commits** tienen el trailer `Co-Authored-By: Claude`.
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
- [Depósito en custodia de obra inédita de software — DNDA](https://www.argentina.gob.ar/registrar-la-autoria-de-un-software-inedito)
- [Registrar software puesto en conocimiento público — DNDA](https://www.argentina.gob.ar/registrar-la-autoria-de-un-software-inedito-0)
- [Resolución INPI 75/2026 — creación de la UMAPI](https://abogados.com.ar/la-unidad-de-medida-arancelaria-de-la-propiedad-industrial-umapi-resolucion-inpi-752026/38789)
- [Aumento de tasas del INPI desde abril de 2026](https://abogados.com.ar/aumento-significativo-de-las-tasas-oficiales-del-inpi-a-partir-del-1-de-abril-de-2026/38803)
