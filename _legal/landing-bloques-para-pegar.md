# Bloques para pegar en la landing `acequia.app`

Repo: `arteytierra/acequia-landing`, clonado en `C:\Arte y Tierra\acequia-landing`.
Fecha: 21/11/2026.

---

## Antes que nada: me equivoqué con el botón

Te ofrecí el enlace de arrepentimiento para la landing **y ya estaba puesto**.
Lo verifiqué recién: `app/layout.tsx` dibuja un `regret-button` flotante en
todas las páginas, el pie de `components/SiteChrome.tsx` lo repite bajo
«Legal», y `app/arrepentimiento/page.tsx` tiene un formulario que registra la
solicitud. En ese punto la landing está mejor que la app.

Lo que sí le falta es lo otro que arreglamos hoy del lado de la app, y es lo
que te dejo acá listo para pegar. Son tres cosas:

1. **Nadie dice quién presta el servicio.** Mismo problema que tenían los
   Términos de la app: el proveedor real no aparece en ninguna parte.
2. **El canal de baja existe pero el derecho no se enuncia.** En ningún lado
   dice «diez días corridos» ni se cita el art. 34 de la Ley 24.240. Tener el
   botón sin decir el plazo cumple la mitad de la Resolución 424/2020.
3. **La marca no figura**, ahora que hay dos registros concedidos.

Y hay una **decisión tuya** que no puedo tomar, más abajo del todo.

---

## 1 · `app/terminos/page.tsx`

Reemplazá la línea entera del `export default function TermsPage()` por esta.
Es una sola línea, como las de ese archivo:

```tsx
export default function TermsPage() { return <main><MarketingHeader /><LegalIntro title="Términos de uso" updated="Última actualización: 21 de noviembre de 2026" /><article className="legal-copy"><h2>1. Quién presta el servicio</h2><p>Acequia es prestado por <strong>Jonatan Gabriel Palma</strong>, que opera bajo el nombre comercial <strong>Arte y Tierra</strong>, con domicilio en San Marcos Sierras, Provincia de Córdoba, República Argentina, y correo electrónico <a href="mailto:info@arteytierra.org">info@arteytierra.org</a>. «Arte y Tierra» es un nombre comercial: quien contrata con vos y responde por el servicio es la persona identificada acá. Cuando estos Términos dicen «nosotros», se refieren a ella.</p><h2>2. Alcance del servicio</h2><p>Acequia es una herramienta digital de lectura, organización y diseño preliminar del territorio. Sus resultados son orientativos y no sustituyen mensuras, inspecciones de campo, estudios geotécnicos, cálculos hidráulicos ni asesoramiento profesional habilitado.</p><h2>3. Cuenta y prueba</h2><p>La persona usuaria es responsable de la información de su cuenta. Antes de autorizar una prueba comercial se muestran el plan elegido, la duración de la prueba, la moneda, el importe previsto, la fecha del primer cobro, la frecuencia de renovación y el modo de cancelar.</p><h2>4. Renovación, cancelación y arrepentimiento</h2><p>Las suscripciones pagas se renuevan automáticamente hasta su cancelación. Si la prueba se cancela antes de finalizar, no se realiza el primer cobro y la cuenta pasa al alcance disponible del plan Semilla.</p><p><strong>Derecho de revocación.</strong> Si contratás como consumidor, podés revocar la contratación dentro de los <strong>diez (10) días corridos</strong> contados desde que la hiciste, <strong>sin expresar motivo y sin costo alguno</strong> (arts. 34 y siguientes de la Ley 24.240). Te devolvemos el importe por el mismo medio de pago. Para ejercerlo alcanza con el canal de <a href="/arrepentimiento">arrepentimiento y baja</a>, visible en todo el sitio, o con un correo a <a href="mailto:info@arteytierra.org">info@arteytierra.org</a> desde la casilla de tu cuenta. No hace falta ningún otro trámite ni justificación.</p><h2>5. Propiedad intelectual</h2><p>El servicio, su código, diseño, interfaz, algoritmos, cálculos y bases de conocimiento propias son obra de <strong>Jonatan Gabriel Palma</strong>, su único titular, y están protegidos por la Ley 11.723. <strong>«acequia»</strong> es una marca registrada ante el Instituto Nacional de la Propiedad Industrial bajo los registros N.º 3.978.600 y N.º 3.976.649, clase 42. No se te transfiere ningún derecho de propiedad: recibís una licencia limitada de uso. Los datos y contenidos que cargás vos son tuyos.</p><h2>6. Fuentes y responsabilidad</h2><p>La disponibilidad y precisión de datos varían por país, fuente, fecha y resolución. Cada lectura debe interpretarse dentro de sus límites y verificarse en campo cuando una decisión pueda afectar personas, bienes o ecosistemas. En la máxima medida que permita la ley aplicable, no respondemos por decisiones tomadas en base a esa información. Nada de esto limita los derechos que te reconoce la Ley 24.240 si contratás como consumidor.</p><h2>7. Pagos</h2><p>Los datos de tarjeta los procesa el proveedor de pago elegido (Mercado Pago o PayPal). Acequia no almacena números completos de tarjeta ni códigos de seguridad: sólo referencias de cliente, estado y datos operativos de la suscripción.</p><h2>8. Ley aplicable y jurisdicción</h2><p>Estos Términos se rigen por las leyes de la República Argentina. Si contratás como consumidor, es competente el tribunal que corresponda a tu domicilio, y podés recurrir además al Servicio de Conciliación Previa en las Relaciones de Consumo (COPREC) y a la autoridad de defensa del consumidor de tu jurisdicción. En los demás casos, las partes se someten a los tribunales ordinarios de la Provincia de Córdoba.</p></article><MarketingFooter /></main>; }
```

**Qué cambió, para que lo revises sin diffear:** entra la sección 1 con la
identificación, se renumera todo, la 4 gana el párrafo de los diez días, entra
una 5 de propiedad intelectual con los dos registros de la marca, la 8 pone
jurisdicción de consumidor, y **desaparece la vieja sección 6 «Revisión
pendiente»**, que decía que el texto era un borrador mientras el sistema cobra
en producción. También saqué «los cobros permanecerán desactivados hasta
completar las pruebas de sandbox»: eso ya no es cierto.

---

## 2 · `app/privacidad/page.tsx`

Dos reemplazos quirúrgicos, no hace falta tocar el resto.

**a) El encabezado.** Buscá:

```tsx
<p>Borrador de preproducción · requiere revisión legal antes de cobrar</p></section><article className="legal-copy"><h2>1. Datos que se utilizan</h2>
```

y reemplazalo por:

```tsx
<p>Última actualización: 21 de noviembre de 2026</p></section><article className="legal-copy"><h2>1. Quién es responsable</h2><p>El <strong>responsable del tratamiento</strong> de tus datos, en los términos de la Ley 25.326 de Protección de los Datos Personales, es <strong>Jonatan Gabriel Palma</strong>, que opera bajo el nombre comercial <strong>Arte y Tierra</strong>, con domicilio en San Marcos Sierras, Provincia de Córdoba, República Argentina, y correo electrónico <a href="mailto:info@arteytierra.org">info@arteytierra.org</a>.</p><h2>2. Datos que se utilizan</h2>
```

(y corré en uno los números de los títulos siguientes: `2.` pasa a `3.`, y así
hasta el último).

**b) Los derechos.** Buscá el párrafo que empieza `La persona usuaria podrá
solicitar acceso, corrección o eliminación` y reemplazalo por:

```tsx
<p>Podés pedir acceso, rectificación, actualización o supresión de tus datos escribiendo a <a href="mailto:info@arteytierra.org">info@arteytierra.org</a>. Respondemos dentro de los plazos legales: diez (10) días corridos para el acceso y cinco (5) días hábiles para la rectificación o la supresión. Las solicitudes de baja o arrepentimiento también pueden iniciarse desde el <a href="/arrepentimiento">canal específico</a>. Si considerás que no cumplimos, podés reclamar ante la <strong>Agencia de Acceso a la Información Pública</strong>, órgano de control de la Ley 25.326.</p>
```

Y donde el último título dice «Revisión pendiente», con el párrafo que aclara
que es una propuesta de producto y no una política definitiva: sacalo, por la
misma razón que en los Términos.

---

## 3 · `app/arrepentimiento/page.tsx`

Un párrafo. Buscá, dentro de la rama `pagos ?`:

```tsx
? <p>Si contrataste un plan y querés darlo de baja, o arrepentirte de la contratación, este canal está abierto: enviás la solicitud acá y recibís una constancia. No hace falta pasar por ninguna otra pantalla.</p>
```

y reemplazalo por:

```tsx
? <><p>Si contrataste un plan y querés darlo de baja, o arrepentirte de la contratación, este canal está abierto: enviás la solicitud acá y recibís una constancia. No hace falta pasar por ninguna otra pantalla.</p><p><strong>Tenés diez (10) días corridos</strong> desde la contratación para arrepentirte <strong>sin expresar motivo y sin costo alguno</strong>, y recuperar el importe por el mismo medio de pago (arts. 34 y siguientes de la Ley 24.240). Pasado ese plazo también podés dar de baja cuando quieras: no hay permanencia, el acceso sigue hasta que termine el período abonado y después la cuenta vuelve al plan Semilla, con los proyectos intactos.</p></>
```

---

## Lo que tenés que decidir vos

**El correo.** La landing usa `info.arteytierra@gmail.com` en los tres lugares
—privacidad, el formulario de `AccountRequestForm.tsx` y el pie— y la app usa
`info@arteytierra.org`. Los bloques de arriba escriben `info@arteytierra.org`
porque es el que figura como identificación del proveedor en las páginas
legales de la app, y tener dos casillas distintas para el mismo derecho es
exactamente el tipo de cosa que un inspector anota.

Si el que leés de verdad es el Gmail, decímelo y te paso los bloques con ése:
la decisión es cuál atendés, no cuál queda más prolijo. Lo que no puede pasar
es que la app diga una y la landing otra.

**Y falta cambiarlo en dos lugares más** que no están en estos bloques:
`components/AccountRequestForm.tsx` (el `mailto:` del pie del formulario) y
`components/SiteChrome.tsx` (el enlace «Contacto» del pie).
