# Capas culturales locales — Europa occidental

Esta capa **no se monta**. Va separada por la misma razón que en el paquete americano: un saber no se activa por país ni por clase de Köppen, se activa por territorio, y para eso hace falta geometría con procedencia y licencia, que todavía no tenemos.

Lo que sigue es un inventario de lo documentado, con el territorio mínimo al que corresponde. El inventario en JSON está en `fase-2-saberes-territoriales/inventario-saberes-documentados.json`.

## Por qué importa acá en particular

Europa occidental es donde más tienta el atajo. La ficha `mediterraneo_europeo` ya trae dehesa y montado adentro del campo `saberes`, y hoy se le muestran igual a un predio de Cataluña, de Mallorca o de la Provenza, que no tienen ni dehesa ni montado. Es exactamente lo que la separación en dos capas viene a evitar. Cuando la capa territorial exista, esos dos saberes deberían moverse ahí y salir de la ficha ecológica.

## Inventario, 26 entradas

**Península ibérica**

- **Dehesa** — Extremadura, Salamanca, Huelva, Sevilla, Córdoba. Encinar y alcornocal pastoreado con bellota, corcho y cereal de secano. Territorio mínimo: comarca. Geometría: falta.
- **Montado** — Alentejo, Ribatejo, Algarve serrano. El equivalente portugués, con más peso del corcho. Territorio mínimo: distrito o concelho. Geometría: falta.
- **Careo de Sierra Nevada** — Alpujarra granadina y almeriense. Acequias que infiltran agua de deshielo en cabecera para que aflore semanas después en manantiales aguas abajo. Reconocido como sistema histórico de recarga. Territorio mínimo: cuenca de acequia. Geometría: falta. *Nota: es el saber europeo más directamente relevante para lo que la app calcula.*
- **Boqueras y riego de turbias** — Almería, Murcia, Alicante. Derivación de la avenida de rambla hacia bancales para dejar agua y limo. Territorio mínimo: rambla. Geometría: falta.
- **Huerta de Valencia y Tribunal de las Aguas** — Vega del Turia. Reparto por turnos con tribunal consuetudinario. Territorio mínimo: acequia madre. Geometría: falta.
- **Bancales de la Ribeira Sacra y del Duero vinatero** — Galicia interior, Douro portugués. Viña en terrazas de pizarra sobre pendientes extremas. Territorio mínimo: comarca. Geometría: falta.
- **Souto y minifundio gallego** — Galicia, norte de Portugal. Castañar de fruto, prado de siega, monte comunal en mano común. Territorio mínimo: parroquia. Geometría: falta.
- **Brañas y pastos de montaña cantábricos** — Asturias, Cantabria, León. Trashumancia corta a pastos de altura. Territorio mínimo: concejo. Geometría: falta.
- **Trashumancia por cañadas reales** — Castilla, Extremadura, Aragón. Red de vías pecuarias con estatuto jurídico propio. Territorio mínimo: traza de cañada. Geometría: existe cartografía oficial; falta licencia verificada.

**Francia, Bélgica, Países Bajos, Luxemburgo**

- **Bocage bretón y normando** — Bretaña, Normandía, Mayenne. Setos sobre talud, trasmochos, parcelas chicas. Territorio mínimo: departamento o país tradicional. Geometría: falta.
- **Bocage de las Ardenas** — Ardenas belgas y francesas, Luxemburgo. Variante de altura, con más pastura permanente. Territorio mínimo: comarca. Geometría: falta.
- **Hortillonnages de Amiens** — Somme. Huertas sobre islas entre canales en llanura aluvial. Territorio mínimo: sitio. Geometría: falta.
- **Marais y wateringues** — Flandes marítimo, Pas-de-Calais, Zelanda. Drenaje colectivo de marisma con juntas de agua históricas. Territorio mínimo: cuenca de wateringue. Geometría: falta.
- **Polder y waterschap** — Países Bajos. Gestión colectiva del nivel freático por corporación de agua, con estatuto público desde el siglo XIII. Territorio mínimo: polder. Geometría: existe cartografía oficial neerlandesa; falta licencia verificada.
- **Houtwallen y Elzensingels** — Drenthe, Achterhoek, Twente. Bandas leñosas sobre camellón de tierra como límite, cortaviento y leña. Territorio mínimo: comarca. Geometría: falta.
- **Essen y plaggenboden** — Drenthe, Veluwe, Campine. Suelos antropogénicos construidos durante siglos con capas de brezo, arena y estiércol sobre podzol pobre. Territorio mínimo: comarca. Geometría: falta.
- **Landes y pastoreo del brezal** — Landas de Gascuña, Campine. Manejo del brezal con pastoreo y quema controlada previo a la forestación masiva. Territorio mínimo: comarca. Geometría: falta.

**Islas británicas e Irlanda**

- **Downland grazing sobre creta** — Chilterns, North y South Downs. Pastoreo ovino extensivo que sostiene el pastizal calcáreo. Territorio mínimo: cadena de colinas. Geometría: falta.
- **Hedgerow y enclosure** — Inglaterra y Gales. Setos de espino como límite legal, cortaviento y hábitat, con normativa de protección propia. Territorio mínimo: condado. Geometría: falta.
- **Ffridd y hafod-hendre galés** — Gales. Movimiento estacional entre granja de valle y pasto de altura. Territorio mínimo: comarca. Geometría: falta.
- **Machair** — Hébridas Exteriores, costa oeste de Irlanda. Rotación de cebada y avena con descanso y pastoreo invernal sobre arena de conchilla. Extremadamente frágil. Territorio mínimo: costa insular. Geometría: falta.
- **Crofting** — Highlands e islas de Escocia. Tenencia pequeña regulada por ley propia, con pasto común. Territorio mínimo: crofting township. Geometría: existe registro oficial; falta licencia verificada.
- **Corte de turba doméstica** — Irlanda, Escocia. Práctica de subsistencia histórica hoy en conflicto con la conservación de turbera. Territorio mínimo: bog. Geometría: falta. *Cautela explícita: documentar, no recomendar; drenar turbera es contrario a lo que la app debería aconsejar.*
- **Muinteanas y campos de piedra del oeste irlandés** — Connemara, Aran, Burren. Muros de piedra seca y suelos construidos con arena y algas. Territorio mínimo: comarca. Geometría: falta.
- **Winterage del Burren** — Clare. Pastoreo invertido: el ganado sube a la caliza en invierno y baja en verano, al revés de la trashumancia alpina. Territorio mínimo: comarca. Geometría: falta.

**Suiza occidental**

- **Bisses del Valais** — Valais. Canales de gravedad en ladera con turnos comunitarios. Ya está recogido en `alpino_montano_europeo` vía la inscripción de UNESCO sobre riego tradicional; conviene moverlo a esta capa cuando exista. Territorio mínimo: cuenca de bisse. Geometría: falta.

## Cautelas aplicadas

Ninguna entrada publica sitios sensibles, coordenadas, recetas medicinales ni calendarios ceremoniales. El corte de turba y la quema de brezal quedan documentados como práctica histórica con su conflicto explícito, nunca como recomendación. No se universaliza fuego, pastoreo ni drenaje: cada entrada lleva su territorio mínimo y ninguna se activa sin geometría.

## Estado

26 saberes documentados, **0 activables**. Falta lo mismo que en el paquete americano: un tipo `SaberTerritorial`, una fuente de geometría subnacional con procedencia y licencia, y la decisión de dónde vive esa geometría.
