# Las cinco cartas

Cuatro censos relevados, validados y listos para montar que **no se montan por
falta de permiso, no por falta de trabajo**, más un quinto pedido que es de otra
naturaleza: la capa territorial de FUNAI para el Brasil, cuyo censo ya está
montado. El JSON de cada país está al lado,
en `../`. El día que llegue una autorización, montar el país es trabajo de
horas, no de días: Brasil tardó una tarde.

El detalle de por qué cada uno está bloqueado está en `../COBERTURA.md`.

## A dónde va cada una

| Carta | Organismo | Correo | Canal formal alternativo |
|---|---|---|---|
| `01-ine-bolivia.md` | INE Bolivia | `info@ine.gob.bo` (copia `ceninf@ine.gob.bo`) | Formulario único de requerimiento de información, o nota a la Dirección General Ejecutiva |
| `02-dane-colombia.md` | DANE Colombia | `contacto@dane.gov.co` | Ventanilla Única PQRSD: https://www.dane.gov.co/index.php/ventanilla-unica/pqr-s |
| `03-inec-ecuador.md` | INEC Ecuador | `inec@inec.gob.ec` | Sistema de tickets: https://www.ecuadorencifras.gob.ec/requerimientos-de-informacion/ — **conviene hacer las dos cosas** |
| `04-ine-uruguay.md` | INE Uruguay | `difusion@ine.gub.uy` | — |
| `05-funai-brasil.md` | FUNAI Brasil | **no va por correo:** Fala.BR https://falabr.cgu.gov.br/ | `sic@funai.gov.br`, sólo si la plataforma está caída |

Las primeras cuatro direcciones se verificaron el **24/09/2026** en la página oficial de
cada organismo (y, en el caso del Ecuador, en la Guía Oficial de Trámites del
Estado, actualizada el 28/10/2025). No son direcciones deducidas del dominio. El canal de FUNAI se verificó el
**25/09/2026** en la página oficial del servicio en gov.br: la propia FUNAI dice
que el pedido de acceso a la información se registra en Fala.BR y que el correo
del SIC es sólo contingencia. Está abierto a cualquier persona «independente de
idade ou nacionalidade», así que no hace falta CPF brasileño.

## Antes de mandarlas

Las cinco cartas tienen dos campos a completar, marcados entre corchetes:

- `[APELLIDO]`
- `[TELÉFONO CON CÓDIGO DE PAÍS]` — conviene que esté: es un pedido a un
  organismo extranjero y un teléfono hace la diferencia entre un correo y un
  trámite.

Y una decisión: si Arte y Tierra tiene una razón social registrada, conviene
nombrarla. A un organismo público le cambia el encuadre que el pedido venga de
una persona o de una empresa, y las cinco cartas dicen explícitamente que el
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

## Lo que ninguna pide

Ninguna pide microdatos. Ninguna propone redistribuir los archivos: las cinco
dicen explícitamente que no habría descarga del archivo desde la aplicación. Y
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
