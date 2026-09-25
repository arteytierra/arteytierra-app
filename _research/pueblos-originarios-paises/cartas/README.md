# Las cuatro cartas

Cuatro censos relevados, validados y listos para montar que **no se montan por
falta de permiso, no por falta de trabajo**. El JSON de cada país está al lado,
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

Las cuatro direcciones se verificaron el **24/09/2026** en la página oficial de
cada organismo (y, en el caso del Ecuador, en la Guía Oficial de Trámites del
Estado, actualizada el 28/10/2025). No son direcciones deducidas del dominio.

## Antes de mandarlas

Cada carta tiene dos campos a completar, marcados entre corchetes:

- `[APELLIDO]`
- `[TELÉFONO CON CÓDIGO DE PAÍS]` — conviene que esté: es un pedido a un
  organismo extranjero y un teléfono hace la diferencia entre un correo y un
  trámite.

Y una decisión: si Arte y Tierra tiene una razón social registrada, conviene
nombrarla. A un organismo público le cambia el encuadre que el pedido venga de
una persona o de una empresa, y las cuatro cartas dicen explícitamente que el
producto es pago.

## Qué pide cada una

No son cuatro veces la misma carta. Lo que bloquea a cada país es distinto:

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
- **Uruguay** — son dos cosas: el **total absoluto** (los cuadros sólo publican
  6,3% redondeado, y multiplicarlo sería una estimación nuestra) y las
  condiciones de reutilización de los cuadros agregados. La carta aclara que no
  pedimos microdatos.

## Lo que ninguna pide

Ninguna pide microdatos. Ninguna propone redistribuir los archivos: las cuatro
dicen explícitamente que no habría descarga del XLSX desde la aplicación. Esa
es la diferencia entre un pedido que un área de difusión puede resolver y uno
que tiene que subir a un comité.

## Si no contestan

Los plazos declarados son de 15 días hábiles (Ecuador) y 15 días hábiles
(Colombia, por la vía de PQRSD). Bolivia y Uruguay no declaran plazo en el
canal de correo. A los 20 días hábiles conviene reiterar por el canal formal
alternativo de la tabla, que deja constancia de radicación.

## Un quinto pendiente, distinto

**FUNAI (Brasil)** no está en esta lista porque Brasil ya está montado: lo que
falta ahí no es el censo sino las **Tierras Indígenas**, y el bloqueo es otro
—el pie del sitio de FUNAI usa CC BY-ND 3.0, «sin derivadas», y montar la capa
es hacer una derivada—. Si en algún momento se quiere esa capa, hace falta una
carta propia pidiendo autorización de transformación, más un enlace estable:
el WFS oficial devolvía HTTP 403 al momento del relevamiento.
