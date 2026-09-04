# México — Edafología Serie II y perfiles de suelo (INEGI)

**Tipo:** suelo
**Estado:** DESCARTADA
**Prioridad sugerida:** alta

## Qué mejora sobre la fuente global

Cartografía oficial 1:250.000 y base de 1.901 perfiles/14.349 horizontes con pH, carbono orgánico, conductividad eléctrica, CIC y porcentajes de arena/limo/arcilla. Gran complemento local de SoilGrids.

## Cobertura

México nacional. La serie oficial disponible es **Serie II**, no “Serie VII”; las mediciones principales son 2002–2006 aunque la edición nacional fue actualizada.

## Licencia

Los Términos de libre uso INEGI permiten explotación comercial, adaptación y extracción con atribución y declaración de transformaciones: https://www.inegi.org.mx/contenidos/inegi/doc/terminos_info.pdf. La licencia es apta.

## Acceso técnico

DESCARTADA técnicamente: el producto oficial ofrece descargas completas (SHP ~175 MB; perfiles ~1,25 GB), no un servicio vivo documentado por punto/bbox.

Ficha de producto: `GET https://www.inegi.org.mx/app/biblioteca/ficha.html?upc=794551131916`

Perfiles: `https://www.inegi.org.mx/app/biblioteca/ficha.html?upc=702825266707`.

## Campos que devuelve

En perfiles: profundidad/horizonte, pH, carbono orgánico, CE, CIC, arena, limo, arcilla y saturación de bases, entre otros.

## Qué falta o qué no da

API WFS/REST puntual estable. El README descarta fuentes que obliguen a descargar y hospedar un dataset nacional grande.

## Verificación

Revisado el 2026-08-31. La página oficial `https://www.inegi.org.mx/programas/sue/` identifica Edafología Serie II 1:250.000; no publica Serie VII. No fue posible producir respuesta puntual sin alojar el archivo, razón del estado DESCARTADA.
