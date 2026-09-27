# Las seis cartas

Cuatro censos relevados, validados y listos para montar que **no se montan por
falta de permiso, no por falta de trabajo**, más dos pedidos que son de otra
naturaleza: la capa territorial de FUNAI para el Brasil y el Catálogo Nacional de
Pueblos del INPI para México, dos países cuyo censo ya está montado. El JSON de
cada país está al lado, en `../`. El día que llegue una autorización, montar el
país es trabajo de horas, no de días: Brasil tardó una tarde.

**La sexta es distinta de las otras cinco y conviene no tratarla igual.** A los
institutos de estadística les pedimos permiso para reproducir cifras agregadas. Al
INPI le pedimos permiso para reproducir **nombres de pueblos**. No es un trámite de
licencia, es preguntar antes de usar el nombre de alguien, y la carta está escrita
así a propósito.

El detalle de por qué cada uno está bloqueado está en `../COBERTURA.md`.

## A dónde va cada una

| Carta | Organismo | Correo | Canal formal alternativo |
|---|---|---|---|
| `01-ine-bolivia.md` | INE Bolivia | `info@ine.gob.bo` (copia `ceninf@ine.gob.bo`) | Formulario único de requerimiento de información, o nota a la Dirección General Ejecutiva |
| `02-dane-colombia.md` | DANE Colombia | `contacto@dane.gov.co` | Ventanilla Única PQRSD: https://www.dane.gov.co/index.php/ventanilla-unica/pqr-s |
| `03-inec-ecuador.md` | INEC Ecuador | `inec@inec.gob.ec` | Sistema de tickets: https://www.ecuadorencifras.gob.ec/requerimientos-de-informacion/ — **conviene hacer las dos cosas** |
| `04-ine-uruguay.md` | INE Uruguay | `difusion@ine.gub.uy` | — |
| `05-funai-brasil.md` | FUNAI Brasil | **no va por correo:** Fala.BR https://falabr.cgu.gov.br/ | `sic@funai.gov.br`, sólo si la plataforma está caída |
| `06-inpi-mexico.md` | INPI México | **sin verificar:** falta el correo de la Unidad de Transparencia | Plataforma Nacional de Transparencia: https://www.plataformadetransparencia.org.mx/ |

Las primeras cuatro direcciones se verificaron el **24/09/2026** en la página oficial de
cada organismo (y, en el caso del Ecuador, en la Guía Oficial de Trámites del
Estado, actualizada el 28/10/2025). No son direcciones deducidas del dominio. El canal de FUNAI se verificó el
**25/09/2026** en la página oficial del servicio en gov.br: la propia FUNAI dice
que el pedido de acceso a la información se registra en Fala.BR y que el correo
del SIC es sólo contingencia. Está abierto a cualquier persona «independente de
idade ou nacionalidade», así que no hace falta CPF brasileño.

## El destinatario de la sexta está sin verificar

Las cinco primeras llevan direcciones comprobadas en la página oficial de cada
organismo. **La del INPI no.** Lo que se comprobó el 27/09/2026:

- `catalogo.inpi.gob.mx` **sí abre** —200, 56 KB, con API REST, tres accesos de
  consulta, una página `/cedulas/` y el PDF del DOF del 21/02/2025—. Un
  relevamiento anterior decía que fallaba por certificado; hoy no falla. El dato
  es accesible: lo que falta es el permiso, que es otra cosa.
- `www.inpi.gob.mx` redirige a `gob.mx/inpi`, que devuelve una cáscara de
  JavaScript sin texto. No se pudo leer ninguna página de contacto, y ninguna
  página del catálogo publica un correo.
- `plataformadetransparencia.org.mx` no abre desde esta máquina (falla el TLS).

Así que antes de mandarla hay que entrar a `gob.mx/inpi` desde un navegador
normal y buscar la Unidad de Transparencia, o el área que administra el catálogo.
Si no hay correo, la vía que corresponde es la solicitud por la Plataforma
Nacional de Transparencia: es gratuita y tiene plazo de ley.

## Antes de mandarlas

Las seis cartas tienen dos campos a completar, marcados entre corchetes:

- `[APELLIDO]`
- `[TELÉFONO CON CÓDIGO DE PAÍS]` — conviene que esté: es un pedido a un
  organismo extranjero y un teléfono hace la diferencia entre un correo y un
  trámite.

Y una decisión: si Arte y Tierra tiene una razón social registrada, conviene
nombrarla. A un organismo público le cambia el encuadre que el pedido venga de
una persona o de una empresa, y las seis cartas dicen explícitamente que el
producto es pago.

## Qué pide cada una

No son cinco veces la misma carta. Lo que bloquea a cada país es distinto:

- **Bolivia** — los términos del INE no son una licencia abierta y condicionan
  el uso comercial. Se pide autorización.
- **Colombia** — el DANE autoriza la cita, pero su página de microdatos exige
  *visto bueno escrito* para reproducir los datos en medios que los pongan a
  disposición de múltiples usuarios. Se pide ese visto bueno. La carta menciona
  que ya usamos la capa de resguardos de la ANT bajo CC BY-SA 4.0, porque
  muestra que leímos las licencias y respetamos CompartirIgual.
- **Ecuador** — el pie del sitio declara CC BY 4.0 Internacional pero el archivo
  del censo no lleva licencia adjunta. Se pide que confirmen si la licencia del
  sitio alcanza al tabulado; si sí, no hace falta nada más.
- **Brasil (FUNAI)** — no es el censo, que ya está montado con el IBGE, sino las
  **Terras Indígenas** y las aldeas. El bloqueo es doble: el pie del sitio de
  FUNAI usa CC BY-ND 3.0 «sin derivadas» y montar una capa es hacer una
  derivada, mientras la página de geoprocesamiento dice otra cosa —que se puede
  reproducir citando la fuente—. La carta pide que aclaren cuál prevalece, y de
  ahí la autorización de transformación y uso comercial. Y pide un enlace
  estable: el WFS devolvía 403 y el espejo ODS sí respondía.
- **Uruguay** — son dos cosas: el **total absoluto** (los cuadros sólo publican
  6,3% redondeado, y multiplicarlo sería una estimación nuestra) y las
  condiciones de reutilización de los cuadros agregados. La carta aclara que no
  pedimos microdatos.
- **México (INPI)** — no es el censo, que ya está montado con el INEGI y cuya
  licencia autoriza expresamente el uso comercial, sino el **Catálogo Nacional de
  Pueblos y Comunidades**, que es la única lista oficial de pueblos de México. El
  bloqueo no es una licencia contradictoria: es que **no hay ninguna declaración**
  sobre qué puede hacerse con la información. La carta pide sólo los **nombres de
  pueblo** y el municipio, escritos como el propio catálogo los escribe —hoy ya
  usa los endónimos: «Wixárika», «N'dee o N'nee o Ndé», «P'urhépecha»—, y renuncia
  por escrito a todo dato de comunidad individual: nombres, autoridades,
  domicilios, cédulas y constancias. Y pregunta dos cosas que ninguna otra
  pregunta: si el INPI considera que hay una forma correcta de presentarlo, y si
  existe un canal para que una comunidad pida no aparecer en aplicaciones de
  terceros.

## Lo que ninguna pide

Ninguna pide microdatos. Ninguna propone redistribuir los archivos: las seis
dicen explícitamente que no habría descarga del archivo desde la aplicación. Y la
del INPI agrega el límite más fuerte de todas: **ningún dato de comunidad
individual**, que es la parte del catálogo que no nos corresponde tener. Y
la de FUNAI agrega un límite que las otras no necesitan: **no republicar las
coordenadas de las aldeas.** Ofrece mostrar si el predio cae dentro de una Terra
Indígena o a qué distancia está, y la cantidad de aldeas agregada por TI, pero
no los puntos localizables. Eso no es una concesión para conseguir el permiso:
es lo que corresponde, y además convierte el pedido en algo que un área técnica
puede resolver. Esa
es la diferencia entre un pedido que un área de difusión puede resolver y uno
que tiene que subir a un comité.

## Si no contestan

Los plazos declarados son de 15 días hábiles (Ecuador) y 15 días hábiles
(Colombia, por la vía de PQRSD). Bolivia y Uruguay no declaran plazo en el
canal de correo. **Brasil es el único con plazo de ley**: la Lei de Acesso à
Informação (Lei n.º 12.527/2011) da 20 días corridos, prorrogables por 10 con
justificación, y el Fala.BR entrega usuario y contraseña justamente para poder
recurrir cuando se vence.

En los cuatro primeros, a los 20 días hábiles conviene reiterar por el canal
formal alternativo de la tabla, que deja constancia de radicación. En el de
FUNAI no: ahí el reclamo va por la misma plataforma, y el correo del SIC no
sirve para eso —la propia FUNAI aclara que no se usa para pedidos de acceso a la
información—.

## Por qué la quinta va en portugués

Las otras cuatro van a organismos de países hispanohablantes. FUNAI es un órgano
federal brasileño y el pedido se registra en una plataforma en portugués, así que
escribirla en español sería hacerle el trabajo más difícil a quien la tenga que
leer y derivar.

Y va por un canal distinto de los otros cuatro: **no es un correo, es un
expediente.** El Fala.BR es la plataforma de la Contraloría General de la Unión
para los pedidos de acceso a la información de todo el Estado brasileño. Eso
tiene una ventaja que los otros cuatro pedidos no tienen: queda radicado, tiene
plazo de ley y se puede recurrir. La desventaja es que hay que registrarse.
