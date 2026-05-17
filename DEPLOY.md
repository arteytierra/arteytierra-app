# Deploy del nuevo sitio Arte y Tierra

## Lo que tenés listo

📦 **ZIP empaquetado:** `C:\Arte y Tierra\0. Claude\arteytierra-web.zip` (44 KB)
📂 **Carpeta del sitio:** `C:\Arte y Tierra\0. Claude\web\`

8 archivos · 7 páginas HTML · sistema visual completo · bilingüe ES/EN.

---

## OPCIÓN 1 — Deploy gratis en Netlify (recomendada · 60 segundos)

Sin cuenta, sin tarjeta, sin instalar nada.

1. Abrí en el navegador: **https://app.netlify.com/drop**
2. Arrastrá el archivo `arteytierra-web.zip` a la zona de drop
3. Esperá ~10 segundos
4. Te aparece un link tipo: `https://random-name-123.netlify.app`

**Eso ya es tu sitio en internet.** Compartilo.

### Después, si querés:
- Crear cuenta gratis en Netlify (con Google) para que el sitio quede permanente y puedas editarlo
- Conectar tu dominio `arteytierra.org` (Settings → Domain → Add custom domain)
- Cambiar el nombre random por algo lindo

---

## OPCIÓN 2 — Deploy en Vercel

1. https://vercel.com/new → Login con GitHub o Google
2. Subí la carpeta `web/` (drag-drop)
3. Deploy automático

---

## OPCIÓN 3 — Tu hosting actual (donde está arteytierra.org hoy)

Si tu WordPress está en hosting con cPanel u otro panel:

1. Entrá al panel de tu hosting
2. Buscá File Manager / Administrador de archivos
3. Hacé backup de la carpeta `public_html` actual (importante)
4. Borrá el contenido viejo (o moverlo a `public_html_old`)
5. Subí el ZIP `arteytierra-web.zip` a `public_html/`
6. Extraelo ahí (debería quedar `index.html` directamente en `public_html/`)
7. Listo — `arteytierra.org` apunta al sitio nuevo

⚠ Importante: **antes de pisar el sitio actual, hacete un backup completo del WordPress** por si querés volver.

---

## Pendientes para producción

Estas cosas el código las tiene como "demo" o "placeholder" — necesitan que pegues los datos reales:

| Qué | Dónde | Cómo |
|---|---|---|
| **Booking listing** | `taypichin.html` (sección Ecohostel) | Reemplazar el href de "Buscar en Booking" con tu URL directa del listing |
| **Airbnb listing** | `taypichin.html` (sección Ecohostel) | Idem con Airbnb |
| **Formulario de contacto** | `contacto.html`, `voluntariado.html` | Conectar con [Formspree](https://formspree.io) (gratis, 5 min). Reemplazar `<form>` por `<form action="https://formspree.io/f/TU_ID" method="POST">` |
| **Mercado Pago link de pago real** | `cursos.html` | Si querés que el botón redirija directo a un link de pago: generá uno en tu cuenta MP → Vender → Link de pago, y reemplazá el href del botón |
| **Fotos de Drive embebidas** | Todas las páginas | Si en Wordpress querés mejor performance, descargalas y subilas como assets locales |

Estas cosas no bloquean el deploy. El sitio funciona ahora y se mejora gradualmente.

---

## Si querés que las haga yo

Cuando vuelvas, pasame:
1. Link directo Booking del listing de Tay Pichín
2. Link directo Airbnb del listing
3. ID de Formspree (después de crear cuenta) o me decís y te guío
4. Link de pago de Mercado Pago si querés botón directo

Y lo integro todo en una iteración.
