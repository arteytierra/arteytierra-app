# Global — Mapa global de peligrosidad sísmica (GEM Foundation)

**Tipo:** peligrosidad sísmica (categoría nueva: no es suelo, clima ni relieve)
**Estado:** DESCARTADA
**Prioridad sugerida:** baja — salvo que Jonatan decida comprar la licencia

## Qué mejora sobre la fuente global

Acá no compite contra ninguna fuente de la app: **acequia no tiene ningún dato
sísmico**, así que cualquier cosa sería una capa nueva. Esta ficha se escribe por
el caso que la destapó, que no es teórico: al montar las prácticas de las
terrazas de **Ifugao** apareció que la UNESCO documenta **terremotos moviendo
diques de terraza y corriendo nacientes de agua**, y acequia no tiene ningún
campo donde escribir un riesgo así. Un muro de contención, una represa de tierra
y una naciente son exactamente las tres cosas que un sismo mueve.

El mapa de GEM es el candidato obvio: es el modelo global de peligrosidad más
usado, da **PGA y aceleración espectral para 10 % y 2 % de probabilidad de
excedencia en 50 años**, y hay capas ráster y vectoriales por punto.

## Cobertura

El planeta. Versión 2023.1, reemplazada por la **v2026.1**; el mosaico se arma
por regiones y la documentación nombra qué modelo nacional entró en cada una.

## Licencia

**Es lo que cierra la ficha, y en contra.**

- **Las capas ráster y vectoriales —las únicas que sirven para consultar por
  punto— son CC BY-NC-SA 4.0.** NC es **no comercial**, y acequia es un producto
  que se cobra: por la regla dura de esta carpeta, queda afuera. Y encima es SA,
  que es el otro motivo de descarte de la regla.
- Lo que sí es **CC BY-SA 4.0** es el **póster en PDF y el PNG de alta
  resolución**. O sea: la imagen se puede mostrar y hasta usar comercialmente
  atribuyendo, pero sigue siendo copyleft y **no se puede consultar por
  coordenada**, que es lo único que acequia necesita. Una imagen del planeta no
  contesta «cuánto vale el PGA en este predio».
- GEM vende licencias comerciales de las capas, caso por caso, por un formulario
  de *License Request*. **Eso es plata y lo decide Jonatan**, no el relevamiento.

Términos: `https://www.globalquakemodel.org/terms-of-use`. Producto:
`https://www.globalquakemodel.org/product/global-seismic-hazard-map`. Visor con
la licencia de cada capa a la vista: `https://maps.openquake.org/map/gshm-2023-1/`

**La excepción regional, y es importante:** el **ESHM20** —el modelo europeo de
peligrosidad, que GEM distribuye con EFEHR— está liberado con **CC BY 4.0**, que
sí permite uso comercial con atribución, y los datos de entrada y los resultados
están publicados. Para Europa, entonces, **sí hay modelo de peligrosidad usable**,
y merece ficha propia en `europa/` cuando se vaya a implementar. La atribución
pedida es el informe técnico EFEHR TR001 (doi 10.12686/a15).

## Acceso técnico

No se relevó el endpoint: con la licencia cerrada, probar el acceso sería gastar
en una fuente descartada. Queda anotado que el visor de OpenQuake sirve para
**leer un valor a mano** en un caso puntual, que es lo que un proyectista puede
hacer igual sin la app.

## Campos que devuelve

PGA y Sa(0,2 s) y Sa(1,0 s) para 10 % y 2 % en 50 años, en g, sobre roca
referencia. Ninguno equivale a nada que la app ya use.

## Qué falta o qué no da

Falta todo, porque no se puede usar. Lo que **sí** queda disponible con licencia
limpia es otra cosa y contesta otra pregunta: el **catálogo de sismos del USGS**
—ver `global/usgs-catalogo-sismos.md`—, que es historia medida y no peligrosidad
modelada. No son intercambiables y la ficha de al lado explica por qué.

## Verificación

**21/11/2026.** Se verificó la licencia en los términos de GEM, en la página del
producto y en el visor de OpenQuake, que publica la licencia de cada capa; y se
verificó que el ESHM20 europeo es CC BY 4.0 con uso comercial permitido. No se
probó ningún endpoint de datos, a propósito.
