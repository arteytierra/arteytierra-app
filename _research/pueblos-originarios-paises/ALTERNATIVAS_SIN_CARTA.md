# ¿Hay otra fuente que evite las cartas?

Relevado el **26/09/2026**, a raíz de una pregunta concreta: Bolivia, Colombia,
Ecuador y Brasil están relevados pero no montados porque falta una autorización
de licencia. ¿Hay manera de no depender de que contesten?

**Respuesta corta: no hay un dataset alternativo que arregle la licencia.** Las
dos plataformas que parecían el atajo, verificadas hoy, explícitamente no lo son.
Pero hay tres caminos que sí destraban parte del problema, y uno de ellos se
puede usar ya.

---

## Lo que NO sirve, comprobado

### RAISG — Red Amazónica de Información Socioambiental

Publica una capa de Territorios Indígenas actualizada a junio de 2026, en
shapefile y por WMS, para los nueve países amazónicos: Bolivia, Brasil,
Colombia, Ecuador, Guyana, Perú, Surinam, Venezuela y Guyana Francesa. Es decir,
cubre exactamente los cuatro países trabados.

No sirve, y lo dice ella misma:

> «The intellectual property of the data corresponds to the original sources in
> each country, described in the metadata.»

RAISG no otorga licencia: la pasa. La propiedad sigue siendo de FUNAI, de la ANT,
del organismo de cada país. Bajar la capa de RAISG en vez de la de FUNAI no
cambia qué permiso tenemos; cambia de dónde la bajamos. Es el mismo error que ya
está anotado en la memoria del proyecto: **la licencia que vale es la del
dataset, no la del portal.**

### CEPAL — las series censales comparadas

CEPAL/CELADE publica los totales de población indígena de toda América Latina
armonizados entre censos, que es tentador porque resolvería los cuatro países de
una. Tampoco sirve como atajo: sus publicaciones no salen bajo Creative Commons
sino bajo las condiciones de reproducción de Naciones Unidas, que autorizan
reproducir sin permiso previo a **los Estados miembros y sus instituciones
gubernamentales**. Un producto pago de una empresa privada no entra en eso.

Aviso de nivel de evidencia: esto sale de la descripción de sus condiciones, no
de haber abierto la página de copyright de una publicación concreta. Antes de
descartarlo del todo habría que abrir el aviso de copyright de la publicación
específica que se quisiera usar. No cambia la conclusión práctica: no es una
licencia abierta y habría que preguntar igual, o sea, otra carta.

### Native Land Digital

Queda afuera por una razón distinta de la licencia: es colaborativo y
explícitamente no autoritativo. Para una capa que se activa sobre el predio de
alguien y le dice de qué pueblo es ese territorio, una fuente que aclara que no
hay que citarla como autoridad no es una fuente.

---

## Lo que sí sirve

### 1. Distinguir citar un dato de redistribuir una tabla

Es lo más importante de todo esto y no necesita permiso de nadie.

**Decir un número citando la fuente no es reutilizar un dataset.** «Según el
Censo 2022 del IBGE, en Brasil hay 1.694.836 personas indígenas» es un hecho con
atribución: es lo que hace cualquier diario. Lo que necesita licencia es montar
**la tabla**: los 5.570 municipios, los 984 polígonos, los 4.676 puntos.

Eso permite partir la capa en dos y publicar hoy la mitad de arriba:

- **Total nacional con cita** → se puede, en los cuatro países, sin esperar nada.
- **Cifra del municipio o departamento del predio** → es servir una tabla fila
  por fila, y ahí sí hace falta la autorización.
- **Polígonos de territorios** → licencia, sin vueltas.

No es un consuelo menor: hoy esos cuatro países muestran **cero**. Con esto
muestran el total nacional, la pregunta del censo, el universo y la cita, que es
casi todo el valor informativo para alguien que no sabía ni que ese dato existía.
Y la pantalla puede decir por qué no hay dato local todavía.

### 2. Consultar la API oficial en vivo, en vez de guardar una copia

Para Brasil, el IBGE publica los resultados por API (SIDRA). Consultarla en el
momento y mostrar el resultado citando al IBGE es materialmente distinto de
distribuir una copia de la tabla.

Con dos advertencias honestas: **es un criterio, no una certeza jurídica** —
cachear la respuesta 30 días se parece bastante a guardar una copia—, y le pone
al análisis una dependencia de que un servicio público esté arriba. No lo
tomaría como reemplazo de la autorización; sí como el camino a seguir si la
autorización tarda y el dato local se considera imprescindible.

### 3. OpenStreetMap, para la geometría

OSM mapea territorios indígenas con `boundary=aboriginal_lands`, y **ODbL permite
uso comercial con atribución y CompartirIgual sobre la base derivada**. El
proyecto ya aceptó ODbL dos veces —el Quesungual y el waterschap neerlandés son
los dos únicos saberes con territorio aprobado, y los dos entraron por OSM—, así
que no hay nada nuevo que decidir.

Cobertura medida hoy con Overpass, contando relaciones:

| País | Relaciones en OSM | Contra qué se compara |
|---|---:|---|
| Canadá | 2.791 | — |
| Estados Unidos | 435 | — |
| Brasil | 401 | 639 Terras Indígenas de FUNAI → ~63 % |
| Bolivia | 53 | — |
| Panamá | 9 | comarcas y territorios |
| México | 1 | nada |
| Ecuador | 1 | nada |
| Colombia | sin respuesta | Overpass dio 504 dos veces; queda pendiente |

**La trampa, y es grande:** hay que averiguar de dónde salió cada geometría antes
de usarla. Si los 401 territorios brasileños de OSM son una importación de la
capa de FUNAI, entonces ODbL no arregla nada: mueve el problema de lugar, que es
exactamente lo que le criticamos a RAISG. Antes de montar Brasil por OSM hay que
revisar el historial y las fuentes declaradas de esas relaciones. En Canadá y
Estados Unidos la pregunta es menos filosa porque la fuente original ya es
reutilizable.

---

## El camino más corto no pasa por destrabar Brasil

Los dos países que faltan y que **nunca estuvieron trabados** son Estados Unidos
y Canadá.

**Canadá** es la licencia más limpia de todo el proyecto. La Open Government
Licence – Canada, verificada hoy, otorga

> «a worldwide, royalty-free, perpetual, non-exclusive licence to use the
> Information, including for commercial purposes»

con permiso de copiar, modificar, publicar, traducir, adaptar y distribuir, **sin
CompartirIgual** y con atribución como única obligación de fondo. No hay que
pedirle nada a nadie.

**Estados Unidos** es casi seguro reutilizable —las obras del gobierno federal no
son objeto de derecho de autor— pero las páginas que abrí hoy no lo dicen con esas
palabras. Lo que sí encontré en los términos de la API del Census Bureau: no
restringen el uso comercial, exigen mostrar la leyenda «This product uses the
Census Bureau Data API but is not endorsed or certified by the Census Bureau»,
prohíben usar los datos para identificar personas u hogares, y advierten que no
se puede modificar el contenido y seguir atribuyéndoselo al Census Bureau. Eso
último importa para nosotros, que agregamos y derivamos: la atribución tiene que
decir qué hicimos. Queda como tarea del relevamiento de Estados Unidos
—`PROMPT_PUEBLOS_MEXICO.md` lo pone tercero en la fila, y por esto— conseguir la
declaración explícita.

Además la app ya tiene fuente nacional de suelo en Estados Unidos (SSURGO), así
que ahí hay usuarios a los que la capa les serviría.

## Qué haría, en orden

1. **Publicar el total nacional con cita** de Bolivia, Colombia, Ecuador y
   Brasil. No necesita permiso y cambia cuatro países de «nada» a «algo».
2. **Sumar Canadá**, que no requiere ninguna carta.
3. **Sumar Estados Unidos**, confirmando primero la declaración de dominio
   público y la leyenda de atribución.
4. **Esperar las cartas** para el dato local y los polígonos. Siguen siendo
   necesarias; lo que ya no son es el cuello de botella de toda la capa.
5. **Revisar la procedencia de OSM** en Brasil antes de considerarlo sustituto de
   FUNAI, y no antes.
