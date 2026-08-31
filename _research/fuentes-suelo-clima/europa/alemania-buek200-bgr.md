# Alemania — BÜK200 vía WMS de BGR (Bundesanstalt für Geowissenschaften und Rohstoffe)

**Tipo:** suelo
**Estado:** VIVA — **DESCARTADA por licencia no verificable**
**Prioridad sugerida:** baja, salvo que alguien consiga los términos por escrito

## Qué mejora sobre la fuente global

Es el equivalente alemán de SSURGO: la carta de suelos oficial 1:200.000, con
unidades cartográficas mapeadas a campo y, detrás de cada una, un perfil descrito
horizonte por horizonte en el sistema FISBo del BGR. Contra SoilGrids 250 m —que
es un modelo interpolado— sería dato relevado.

El servicio funciona bien y devuelve descripciones de una precisión notable.
Consultando un punto en el centro de Múnich el servicio contesta:

> *Vorherrschend Pararendzinen aus aufgeschüttetem humosem Material, meist über
> carbonatreichem Schotter oder Schotter-Bauschutt-Gemischen im Kerngebiet der
> Stadt München (restliche Flächen zu >70% versiegelt)*

Es decir: pararendzinas sobre material humoso aportado, en general sobre grava
carbonatada o mezcla de grava y escombro, y avisa que más del 70% de la superficie
restante está sellada. Un modelo global no puede saber eso.

## Cobertura

Alemania entera, en 55 hojas de mapa. Bounding box del país:
`[5.8, 47.2, 15.1, 55.1]`.

**Un detalle de arquitectura que cuesta caro si no se sabe:** el WMS no publica
una capa nacional. Publica **una capa por hoja**, numeradas `0` a `54`, con
títulos tipo `CC7934 MÜNCHEN` o `CC5502 KÖLN`. Para consultar un punto hay que
saber primero qué hoja lo contiene. Si se consulta la hoja equivocada el servicio
responde **200 con `features: []`** —igual que si no hubiera dato— así que un
error de hoja se lee como "acá no hay suelo". Habría que armar una tabla de 55
bounding boxes, o consultar varias hojas vecinas y quedarse con la que conteste.

## Licencia

**No verificable, y por eso queda afuera.**

El `GetCapabilities` remite a las condiciones generales del BGR:

> *Allgemeine Geschäftsbedingungen, siehe https://www.bgr.bund.de/AGB — General
> terms and conditions, see https://www.bgr.bund.de/AGB_en. Die bereitgestellten
> Informationen sind bei Weiterverwendung wie folgt zu zitieren: Datenquelle:
> BÜK200, (c) BGR, Hannover, 2018*

Da la fórmula de cita, pero **no dice si permite uso comercial**, y las dos
páginas de condiciones (`/AGB` y `/AGB_en`) devuelven **400 Bad Request**, con y
sin cabeceras de navegador. El catálogo oficial de datos abiertos alemán tampoco
ayuda: las tres entradas de BÜK200 en GovData vienen con el campo de licencia
**vacío**.

Además, ese `(c) BGR` es un aviso de copyright, no una licencia abierta: no es el
caso de SSURGO, que es dominio público federal estadounidense y se puede usar sin
preguntar.

Por la regla dura del README —"si no dice nada y no hay forma de averiguarlo, se
marca DESCARTADA"— acá se corta. **La ficha queda escrita justamente para que
nadie la vuelva a proponer sin resolver esto primero.** La salida, si algún día
interesa, es escribirle al BGR y pedir los términos por escrito; hasta entonces
Alemania se queda con SoilGrids.

## Acceso técnico

- **Endpoint:** `GET https://services.bgr.de/wms/boden/buek200/` — WMS 1.3.0
  (`GetCapabilities`, `GetMap`, `GetFeatureInfo`).
- **Sin clave ni registro.**
- **Formato del punto:** `GetFeatureInfo` con `info_format=application/geo+json`.

**Ejemplo real que funciona** (centro de Múnich, hoja 6 = `CC7934 MÜNCHEN`):

```
https://services.bgr.de/wms/boden/buek200/?service=WMS&version=1.3.0&request=GetFeatureInfo&layers=6&query_layers=6&crs=EPSG:4326&bbox=48.09,11.53,48.19,11.63&width=101&height=101&i=50&j=50&info_format=application/geo%2Bjson&feature_count=5
```

**Respuesta real:**

```json
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "geometry": null,
      "properties": {
        "OBJECTID": "75",
        "NRKART": "55",
        "TKLE_NR": "793455",
        "BGL": "13.1",
        "Legendentext": "Vorherrschend *Pararendzinen aus aufgeschüttetem humosem Material, meist über carbonatreichem Schotter oder Schotter-Bauschutt-Gemischen im Kerngebiet der Stadt München (restliche Flächen zu >70% versiegelt)",
        "Legende": "55 RZn: oj-(k)el/oj-esk,o-Yb",
        "Shape Area": "107792494,980197",
        "Shape Length": "138137,428145",
        "Hinweis": "Null",
        "Profile": "https://fisbo.bgr.de/app/FISBoBGR_Profilanzeige/getProfile.php?KARTE=BUEK200&LEGNR=793455"
      },
      "layerName": "CC7934 MÜNCHEN"
    }
  ]
}
```

Dos detalles que cuestan tiempo:

- **WMS 1.3.0 con `EPSG:4326` invierte el orden de los ejes**: el `bbox` va
  `lat_min,lon_min,lat_max,lon_max`. Es la misma trampa que en GeoMet de Canadá.
- **`Shape Area` viene con coma decimal**, formato alemán: `107792494,980197`.
  Un `parseFloat` lo corta en el entero sin quejarse.

- **Límites de request:** no publicados. El `GetCapabilities` pesa 362 KB.
- **Latencia observada:** ~1 s el `GetFeatureInfo`. Medido el 31/08/2026.

## Campos que devuelve

| Campo | Qué es | Unidad | Equivale en la app a |
|---|---|---|---|
| `Legendentext` | descripción de la unidad de suelo | texto libre, alemán | nada directo — es prosa, no números |
| `Legende` | código de la leyenda | símbolos FISBo | nada directo |
| `BGL` | grupo de paisaje edáfico (Bodengroßlandschaft) | código | aproximaría al tipo de suelo |
| `TKLE_NR` | número de la unidad, llave del perfil | entero | sirve para pedir el perfil |
| `Profile` | URL del perfil completo | HTML | acá están los horizontes |

**El GeoJSON no trae ni un número.** Ni arcilla, ni arena, ni pH, ni conductividad,
ni agua útil: todo eso vive detrás del enlace `Profile`, que devuelve **una página
HTML de 16 KB con tablas** —probada, responde 200— y habría que parsearla. Es
frágil: cualquier rediseño de esa página rompe el adaptador en silencio, y no hay
contrato que lo impida. Aun con la licencia resuelta, eso solo ya la pone abajo
de SSURGO en prioridad.

## Qué falta o qué no da

- **Todos los números que la app usa**, en forma estructurada. Ver arriba.
- **Certeza de licencia.** Es lo que la descarta.

## Verificación

Probado el **31/08/2026**: `GetCapabilities` responde 200 (362 KB, 55 hojas),
`GetFeatureInfo` devuelve la unidad real de Múnich transcrita arriba, y la página
de perfil de FISBo responde 200 con 16 KB de HTML. Las dos URLs de condiciones
del BGR devolvieron 400 en todos los intentos.
