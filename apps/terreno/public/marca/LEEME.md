# Marca acequia

Paquete final v1 (26/08/2026). Colores: azul agua `#2E6B8A`, negro profundo
`#1A1210`, blanco cálido `#F5F0E8`.

## Cuál usar

| Archivo | Dónde | Por qué |
|---|---|---|
| `isotipo-color.svg` | barra superior, avatares, sellos sobre fondo claro | vector puro, escala infinita, 1.4 kB |
| `isotipo-blanco.svg` | bandas oscuras (rótulo de plano) | evita el hack `invert brightness-200` |
| `isotipo-negro.svg` | impresión a un color | — |
| `logo-color.png` | login, registro (fondo claro) | lockup completo |
| `logo-negro.png` | portada del informe | lockup completo, un color |
| `firma-negro.png` | encabezados estrechos del informe | símbolo + wordmark en poca altura |
| `app-icon-512.png` / `-1024.png` | manifest PWA, apple-icon | cuadrado con fondo oscuro |

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
