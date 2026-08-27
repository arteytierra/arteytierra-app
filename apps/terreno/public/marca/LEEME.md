# Marca acequia

Paquete final v1 (26/08/2026). Colores: azul agua `#2E6B8A`, negro profundo
`#1A1210`, blanco cálido `#F5F0E8`.

## Cuál usar

| Archivo | Dónde | Por qué |
|---|---|---|
| `isotipo-color.svg` | usos sueltos sobre fondo claro (mails, docs, exports) | vector puro, escala infinita, 1.4 kB |
| `isotipo-blanco.svg` | usos sueltos sobre fondo oscuro | — |
| `isotipo-negro.svg` | impresión a un color | — |
| `logo-color.png` | login, registro (fondo claro) | lockup completo |
| `logo-negro.png` | portada del informe | lockup completo, un color |
| `firma-negro.png` | encabezados estrechos del informe | símbolo + wordmark en poca altura |
| `app-icon-512.png` / `-1024.png` | manifest PWA, apple-icon | cuadrado con fondo oscuro |

**Dentro de la interfaz no se usa ninguno de estos archivos**: ahí va el
componente `components/Isotipo.tsx`. Ver abajo.

## Por qué la interfaz usa un componente y no estos SVG

`globals.css` pinta el tema oscuro invirtiendo toda la página con un filtro
sobre `<html>`, y **cancela ese filtro sobre `img`** para que el mapa, los
tiles y las fotos no salgan invertidos. Un logo puesto como `<img>` cae del
lado equivocado de esa excepción: se queda en azul oscuro sobre un fondo que
ahora es negro.

`components/Isotipo.tsx` va inline, pinta con `currentColor` y se invierte
junto con el resto del cromo, que es lo que corresponde. Además usa la
geometría de la variante **favicon** (dos anillos, trazo 28) en vez de la del
isotipo grande (cuatro anillos, trazo 10,5): a 20–28 px el trazo fino cae por
debajo del píxel y los cuatro anillos se empastan. Es la compensación óptica
que trae la marca para tamaños chicos, no una deformación.

## Por qué los lockups son PNG y no SVG

Los SVG del paquete que llevan wordmark (`logo-principal`, `firma-compacta`,
`wordmark`, `logo-vertical`) tienen la palabra "acequia" como `<text>` con
`font-family="Century Gothic"`. Century Gothic **no está en la mayoría de las
máquinas ni en el servidor**: el navegador cae a Arial y el logo se ve mal, sin
avisar. Los PNG traen la tipografía ya rasterizada, así que son los correctos
para web.

Los SVG que sí usamos (`isotipo`, `favicon`, `app-icon`) son trazos puros, sin
texto: esos escalan sin riesgo.

Si algún día se convierte el wordmark a curvas, ahí sí se puede pasar todo a SVG.

## Regla de marca

No deformar, inclinar, recolorear parcialmente ni cambiar la relación entre
símbolo y wordmark. Los PNG blancos tienen fondo transparente: sobre fondo
blanco se ven vacíos.

Fuente: `C:\Arte y Tierra\Acequia\Acequia_Logo_Final_v1`
