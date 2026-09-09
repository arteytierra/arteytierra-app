# Revisión legal — Términos de uso y Política de privacidad de Acequia

**Estado:** borrador con los datos de Jonatan cargados (08/09/2026). Falta el "ok"
de alguien con responsabilidad legal antes del primer cobro real. Bloquea el
paso 8 de la mudanza.

## Lo que cambié respecto de lo que respondiste

- **Arrepentimiento: lo dejé en 10 días corridos, no 3.** Los 3 días son la
  *prueba gratis*, otra cosa. El derecho de arrepentimiento de servicios
  contratados a distancia es de **10 días corridos por ley** (art. 1110 del
  Código Civil y Comercial + art. 34 de la Ley 24.240) y es **irrenunciable**:
  no se puede achicar a 3 ni por contrato. Ponerlo en 3 sería una cláusula nula
  y un riesgo con Defensa del Consumidor.
- **Excepción por "servicio digital ya prestado": recomiendo NO usarla.** Se
  puede excluir el arrepentimiento si el servicio ya se ejecutó con
  consentimiento expreso, pero como ya tenés 3 días de prueba gratis, sumar esa
  excepción da poca ventaja y mucho ruido legal. Dejo el arrepentimiento
  completo, con devolución de lo que se haya cobrado.
- **Identificador de métricas (tu pregunta 8): recomiendo 90 días.** Es un hash
  no reversible; si rotamos la sal cada 90 días, nadie queda rastreable más allá
  de ese lapso. Si hoy la sal no rota sola, lo dejo andando cuando toque el
  código de métricas.

## Cómo usar este documento

1. Los textos de abajo reemplazan a los borradores actuales de
   `app/terminos/page.tsx` y `app/privacidad/page.tsx` del landing.
2. Todo lo que dice `〔entre corchetes〕` es un dato que **solo vos o quien lleve
   la parte legal puede completar** — están todos juntos en la lista del final.
3. Cuando estén los corchetes resueltos y alguien con responsabilidad legal diga
   "esto está bien", se pega el texto en esas dos páginas (lo hace Codex o yo, no
   es tu tarea) y recién ahí se avanza con sandbox y con los interruptores de pago.
4. Nada de esto se publica ni se cobra por tenerlo escrito: es un borrador para
   revisar.

---

## TÉRMINOS DE USO

**Última actualización:** 〔fecha de aprobación〕

### 1. Quiénes somos

Acequia es un servicio operado por **Jonatan Gabriel Palma**, CUIT
**20-33402098-4**, con domicilio en **Av. Los Quebrachos y Mariano Moreno, San
Marcos Sierras, Provincia de Córdoba, Argentina**. Consultas:
acequia.app@gmail.com. 〔Condición fiscal a confirmar por el contador — monotributo
o responsable inscripto; no cambia el texto, es para la sección de facturación.〕

### 2. Qué es el servicio y qué no es

Acequia es una herramienta digital de lectura, organización y diseño preliminar
del territorio. Reúne datos públicos de relieve, clima, suelo, hidrología,
ecología y catastro, y ayuda a ordenarlos en informes y esquemas de diseño.

Sus resultados son **orientativos**. No sustituyen mensuras, amojonamientos,
inspecciones de campo, estudios geotécnicos, cálculos hidráulicos, evaluaciones
de impacto ambiental ni asesoramiento de profesionales habilitados. La
disponibilidad y la precisión de los datos varían según el país, la fuente, la
fecha y la resolución; cada lectura debe interpretarse dentro de esos límites y
verificarse en campo cuando una decisión pueda afectar a personas, bienes o
ecosistemas. La persona usuaria es la única responsable de las decisiones que
tome a partir de la información del servicio.

### 3. Cuenta

Para usar Acequia hace falta una cuenta. El acceso se gestiona con Supabase Auth,
con la opción de iniciar sesión con Google. La persona usuaria es responsable de
la veracidad de los datos de su cuenta y del uso que se haga desde ella.

Existe un plan gratuito (Semilla) con alcance limitado y planes pagos (Diseñador,
Estudio) con más capacidad. El detalle vigente de cada plan y su precio se muestra
en el sitio antes de contratar.

### 4. Prueba comercial

Antes de autorizar una prueba comercial paga se muestran, en la misma pantalla y
antes de confirmar: el plan elegido, la duración de la prueba (tres días
corridos), la moneda, el importe previsto del primer cobro, la fecha de ese
primer cobro, la frecuencia de renovación y cómo cancelar.

Si la prueba se cancela antes de que termine, **no se realiza el primer cobro** y
la cuenta pasa al alcance del plan gratuito Semilla.

### 5. Precio, renovación y cancelación

Las suscripciones pagas se renuevan automáticamente —por mes o por año, según lo
elegido— hasta que la persona usuaria las cancele. La cancelación se puede pedir
en cualquier momento desde la cuenta o desde el canal de
[arrepentimiento y baja](/arrepentimiento), que permanece visible en todo el sitio.
Al cancelar, el plan pago sigue activo hasta el final del período ya pagado y no
se renueva; no hay reintegro proporcional por el tiempo no usado, salvo lo que
corresponda por el punto 6.

Los precios pueden actualizarse. Todo cambio de precio se avisa por correo con
antelación suficiente antes de que se aplique a una renovación, y la persona
usuaria puede cancelar antes de esa renovación si no está de acuerdo.

### 6. Derecho de arrepentimiento

De acuerdo con los arts. 34 de la Ley 24.240 y 1110 del Código Civil y Comercial,
la persona usuaria puede arrepentirse de la contratación dentro de los **10 días
corridos** desde que contrató, sin costo y sin expresar motivo, usando el canal
de [arrepentimiento y baja](/arrepentimiento) o escribiendo a
acequia.app@gmail.com. Si al momento del arrepentimiento ya se había cobrado un
importe, se reintegra en su totalidad. Este plazo no se aplica sobre la prueba
gratuita de tres días, durante la cual no hay ningún cobro.

### 7. Pagos

Los cobros se procesan a través de los proveedores de pago habilitados
(actualmente Mercado Pago para pagos en pesos y PayPal para pagos en dólares).
Los datos de la tarjeta se ingresan y se guardan en el proveedor de pago, no en
Acequia. Acequia **no almacena** números completos de tarjeta ni códigos de
seguridad; solo conserva una referencia de la suscripción, su estado, el plan, el
período y las fechas de cobro.

### 8. Uso aceptable

No está permitido usar el servicio para fines ilícitos, intentar vulnerar su
seguridad, sobrecargarlo de forma automatizada, ni revender o redistribuir los
datos de terceros a los que da acceso por fuera de lo que permite cada fuente.
Acequia puede suspender una cuenta que incumpla estos términos.

### 9. Disponibilidad y cambios

El servicio se presta "tal como está". Puede haber interrupciones por
mantenimiento, por fallas de terceros (proveedores de datos, de infraestructura o
de pago) o por causas de fuerza mayor. Acequia puede modificar funciones del
servicio; los cambios que afecten de forma sustancial a un plan pago se avisan
por correo.

### 10. Responsabilidad

En la medida en que lo permita la ley aplicable, la responsabilidad de Acequia
frente a la persona usuaria por el servicio se limita al importe efectivamente
pagado por esa persona en los 12 meses anteriores al hecho que motiva el
reclamo. Nada de esto limita los derechos que la normativa de consumo reconozca
como irrenunciables.

### 11. Datos personales

El tratamiento de datos personales se rige por la
[Política de privacidad](/privacidad), que forma parte de estos términos.

### 12. Ley aplicable y jurisdicción

Estos términos se rigen por las leyes de la República Argentina. Ante un
conflicto, y sin perjuicio del fuero que la normativa de consumo reconozca a la
persona consumidora (que puede demandar ante los tribunales de su propio
domicilio), intervienen los tribunales ordinarios de la Provincia de Córdoba.

### 13. Contacto

Jonatan Gabriel Palma — acequia.app@gmail.com — Av. Los Quebrachos y Mariano
Moreno, San Marcos Sierras, Córdoba, Argentina.

---

## POLÍTICA DE PRIVACIDAD

**Última actualización:** 〔fecha de aprobación〕

### 1. Responsable del tratamiento

Jonatan Gabriel Palma (fundador y director de Arte y Tierra), CUIT 20-33402098-4,
domicilio Av. Los Quebrachos y Mariano Moreno, San Marcos Sierras, Córdoba,
Argentina. Contacto: acequia.app@gmail.com. La inscripción de la base de datos
personales ante la Agencia de Acceso a la Información Pública (Ley 25.326) está
pendiente y se completará antes del lanzamiento comercial.

### 2. Qué datos tratamos y para qué

| Dato | Para qué | Base |
| --- | --- | --- |
| Nombre, correo, identificador de acceso | Crear y operar la cuenta, autenticar | Ejecución del contrato |
| Preferencias y actividad dentro del servicio | Prestar y mejorar las funciones que la persona usa | Ejecución del contrato / interés legítimo |
| Geometrías y ubicaciones de los proyectos | Guardar y procesar los proyectos que la persona crea | Ejecución del contrato |
| Referencia de suscripción, estado, plan, período, fechas de cobro | Gestionar la suscripción y la facturación | Ejecución del contrato / obligación legal |
| (Piloto) profesión, país o región, tipo de proyecto, motivación, consentimiento, fecha y estado de revisión | Seleccionar y acompañar a las personas participantes del piloto | Consentimiento |
| (Piloto) observaciones sobre etapa del recorrido, tipo de problema, impacto, claridad y descripción | Mejorar el producto a partir de las devoluciones | Consentimiento |

### 3. Métricas de uso

Para detectar en qué punto las personas abandonan un recorrido se registran
pantallas y acciones. Estas métricas **no** usan la dirección IP en claro ni el
correo como identificador: emplean un identificador técnico no reversible cuya
sal se rota cada 90 días, de modo que no permite reconocer a una persona más allá
de ese lapso. El recorrido de producto se enciende recién después de esta
revisión de privacidad.

### 4. Acceso con Google

El inicio de sesión con Google se hace mediante Supabase Auth. Acequia recibe
únicamente la información que Google autoriza para identificar la cuenta (nombre,
correo e identificador). No se accede a otros datos de la cuenta de Google.

### 5. Pagos

Los datos sensibles de la tarjeta los procesa y los guarda el proveedor de pago
(Mercado Pago o PayPal). Acequia no almacena números completos de tarjeta ni
códigos de seguridad; solo conserva referencias de cliente y suscripción, estado
y datos operativos del cobro.

### 6. Proveedores y transferencias internacionales

Para prestar el servicio se usan estos proveedores (encargados de tratamiento):

| Proveedor | Rol | País de operación |
| --- | --- | --- |
| Vercel Inc. | Alojamiento y ejecución de la aplicación | Estados Unidos |
| Supabase Inc. | Base de datos y autenticación | Estados Unidos / UE |
| Google LLC | Inicio de sesión con Google (OAuth) | Estados Unidos |
| Resend (y Postmark como alternativa) | Envío de correos transaccionales | Estados Unidos |
| Mercado Pago (MercadoLibre S.R.L.) | Procesamiento de pagos en pesos | Argentina |
| PayPal | Procesamiento de pagos internacionales | Estados Unidos |

Además se consultan fuentes públicas de datos geográficos y climáticos que no
reciben datos personales. Cuando un proveedor opera fuera de Argentina, la
transferencia se realiza al solo efecto de prestar el servicio contratado y bajo
compromiso contractual de ese proveedor de proteger los datos con un nivel
adecuado (art. 12 de la Ley 25.326 y normativa complementaria de la AAIP).

### 7. Cuánto tiempo se conservan

Los datos de la cuenta se conservan mientras la cuenta esté activa y hasta **30
días** después de su baja, salvo que una obligación legal (por ejemplo, respaldo
de facturación) exija conservarlos más. Los datos recogidos para el piloto se
conservan hasta **1 año**. Vencidos esos plazos se eliminan o se anonimizan.

### 8. Seguridad y prevención de abuso

Los formularios procesan señales técnicas mínimas para validar el envío y limitar
el spam. La dirección IP no se conserva en claro: se transforma en un
identificador no reversible que solo sirve para controlar la frecuencia de envío.

### 9. Derechos de la persona usuaria

La persona usuaria puede pedir acceso, rectificación, actualización, supresión de
sus datos y oponerse a ciertos tratamientos, escribiendo a acequia.app@gmail.com.
Las bajas y los arrepentimientos también se inician desde el
[canal específico](/arrepentimiento). La persona usuaria puede además reclamar
ante la Agencia de Acceso a la Información Pública (AAIP), autoridad de control de
la Ley 25.326.

### 10. Cambios en esta política

Si esta política cambia de forma sustancial se avisa por correo o dentro del
servicio antes de que el cambio entre en vigor.

### 11. Contacto

Jonatan Gabriel Palma — acequia.app@gmail.com — Av. Los Quebrachos y Mariano
Moreno, San Marcos Sierras, Córdoba, Argentina.

---

## Lo que queda pendiente

| # | Tema | Quién |
| --- | --- | --- |
| 1 | Confirmar condición fiscal (monotributo / responsable inscripto) — para la sección de facturación, no cambia el texto | contador |
| 2 | Correo de contacto/derechos: `acequia.app@gmail.com` (confirmado 08/09). Cuando exista `hola@acequia.app` o `info@acequia.app`, cambiarlo | — |
| 3 | Iniciar la inscripción de la base de datos ante la AAIP (Ley 25.326) | vos / gestor |
| 4 | Revisión final y "ok" de alguien con responsabilidad legal antes del primer cobro | legal |
| 5 | Que la rotación de la sal de métricas cada 90 días sea real en el código | yo, al tocar métricas |

Cuando tengas el punto 2 resuelto y el 4 firmado, dejo las dos páginas del
landing (`app/terminos/page.tsx` y `app/privacidad/page.tsx`) con este texto
final para que Codex las aplique.
