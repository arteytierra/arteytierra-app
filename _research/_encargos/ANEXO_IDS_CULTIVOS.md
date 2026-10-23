# Anexo — los ids de cultivo

_Generado desde `apps/terreno/lib/especies.ts` el 2026-10-23. **107 ids** en total._

El campo `cultivos` de una ficha de ecorregión **no lleva nombres: lleva ids de
este catálogo**. Un id que no esté en esta lista, o que esté mal tipeado, hace
que la entrada no se muestre nunca. Copiarlo, no escribirlo de memoria.

## La trampa de la tabla, con los casos reales

**Agregado el 23/10/2026.** La primera vez que este anexo se usó —lote 1 de la
fase 4, el Decán— cinco de doce ids no servían, y **tres de los cinco salieron de
copiar la columna del medio**, la del nombre, en vez de la primera. La tabla tiene
tres columnas y la del medio es la que se lee más fácil; de ahí el error.

| se propuso | el id de verdad | qué pasó |
|---|---|---|
| `mijo_perla` | `mijo` | «Mijo perla» es el **nombre** de `mijo` |
| `maiz` | `maiz_tropical` | el id lleva sufijo y el nombre no |
| `gandul` | `guandul` | el nombre es «Guandul / gandul» y se copió la segunda mitad |

**La regla operativa: el id es siempre la primera columna, va entre comillas y
nunca tiene mayúsculas, acentos ni espacios.** Si lo que ibas a escribir tiene un
acento, una mayúscula, una barra o un espacio, es un nombre, no un id. Y si un
nombre trae dos variantes separadas por barra, ninguna de las dos es el id.

Los otros dos que fallaron no eran de formato: `cartamo` y `poroto_urad`
simplemente **no están en el catálogo**. Eso lleva al punto 2 de abajo.

Y si la ficha **no declara** `cultivos`, la app no deja la sección vacía: cae al
catálogo por clase Köppen, que es más grueso pero nunca miente. Entonces, entre
inventar una lista y no declarar nada, **no declarar nada es mejor**: el campo es
opcional a propósito.

Dos cosas más, que son las que arruinan el campo:

1. **Nativa y cultivo son listas distintas.** `especies` es flora nativa —lo que
   crece ahí sin que nadie lo plante— y `cultivos` es lo que la región produce.
   Que una especie sea las dos cosas se cuenta en el texto, no duplicándola.
2. **El catálogo es sesgado y conviene saberlo.** Se armó para América, Europa,
   Medio Oriente, el norte de África e Indomalaya. **No tiene ni una especie
   australiana ni de las islas del Pacífico**: no hay macadamia, ni buffel, ni
   canola, ni kumara, ni fruta del pan de atolón. Para una ficha de Australasia
   eso significa que el suroeste mediterráneo y las sabanas del norte se pueden
   llenar con lo que ya existe —trigo, cebada, colza, alfalfa, sorgo, algodón,
   maní— y que los rangelands áridos y los atolones probablemente no. **Si no
   hay ids que digan la verdad, el campo se deja sin declarar y se explica en
   `notas`.** Agregar especies al catálogo es trabajo de código, no de ficha.

   Y tiene huecos también en las regiones que sí cubre. Los conocidos, al
   23/10/2026: **no hay cártamo** (*Carthamus tinctorius*), que es el oleaginoso
   de post-monzón del vertisol del Decán, ni **poroto urad** (*Vigna mungo*). Si
   un cultivo central de la ecorregión no está, **nombralo en `notas` con su
   binomial** en vez de reemplazarlo por un pariente: `caupi` no es urad, y
   ponerlo ahí convierte un hueco en un dato falso.

---

| id | nombre | binomial |
|---|---|---|
| `cafe` | Café arábigo | *Coffea arabica* |
| `cacao` | Cacao | *Theobroma cacao* |
| `platano_sombra` | Plátano (sombra temporaria) | *Musa x paradisiaca* |
| `platano` | Plátano / banano | *Musa x paradisiaca* |
| `inga` | Guaba / pacay | *Inga edulis* |
| `yuca` | Yuca / mandioca | *Manihot esculenta* |
| `maiz_tropical` | Maíz de ciclo corto | *Zea mays* |
| `poroto_trepador` | Poroto trepador | *Phaseolus vulgaris* |
| `zapallo_milpa` | Zapallo de guía | *Cucurbita moschata* |
| `canavalia` | Canavalia | *Canavalia ensiformis* |
| `cana_azucar` | Caña de azúcar | *Saccharum officinarum* |
| `arroz` | Arroz | *Oryza sativa* |
| `maracuya` | Maracuyá | *Passiflora edulis* |
| `vainilla` | Vainilla | *Vanilla planifolia* |
| `nogal_cafetero` | Nogal cafetero / laurel | *Cordia alliodora* |
| `pasto_elefante` | Pasto elefante | *Cenchrus purpureus* |
| `crotalaria` | Crotalaria | *Crotalaria juncea* |
| `acai` | Açaí | *Euterpe oleracea* |
| `pupunha` | Pupunha / chontaduro | *Bactris gasipaes* |
| `castana_brasil` | Castaña de Brasil | *Bertholletia excelsa* |
| `coco` | Cocotero | *Cocos nucifera* |
| `name` | Ñame | *Dioscorea alata* |
| `taro` | Taro / malanga | *Colocasia esculenta* |
| `arbol_pan` | Árbol del pan | *Artocarpus altilis* |
| `agave` | Maguey / agave | *Agave salmiana* |
| `nopal` | Nopal | *Opuntia ficus-indica* |
| `sorgo` | Sorgo | *Sorghum bicolor* |
| `mijo` | Mijo perla | *Pennisetum glaucum* |
| `gliricidia` | Madre de cacao | *Gliricidia sepium* |
| `aguacate` | Palta / aguacate | *Persea americana* |
| `amaranto` | Amaranto / kiwicha | *Amaranthus cruentus* |
| `chia` | Chía | *Salvia hispanica* |
| `chile_seco` | Chile / ají de secado | *Capsicum annuum* |
| `guandul` | Guandul / gandul | *Cajanus cajan* |
| `mezquite` | Mezquite | *Prosopis laevigata* |
| `mistol` | Mistol | *Ziziphus mistol* |
| `chanar` | Chañar | *Geoffroea decorticans* |
| `vetiver` | Vetiver | *Chrysopogon zizanioides* |
| `umbu` | Umbú | *Spondias tuberosa* |
| `sisal` | Sisal | *Agave sisalana* |
| `caupi` | Caupí / poroto de vaca | *Vigna unguiculata* |
| `mani` | Maní | *Arachis hypogaea* |
| `batata` | Batata / camote | *Ipomoea batatas* |
| `sesamo` | Sésamo / ajonjolí | *Sesamum indicum* |
| `soja` | Soja | *Glycine max* |
| `algodon` | Algodón | *Gossypium hirsutum* |
| `moringa` | Moringa | *Moringa oleifera* |
| `acacia_goma` | Acacia de goma arábiga | *Senegalia senegal* |
| `lulo` | Lulo / naranjilla | *Solanum quitoense* |
| `mora_andina` | Mora de Castilla | *Rubus glaucus* |
| `uchuva` | Uchuva / aguaymanto | *Physalis peruviana* |
| `tomate_arbol` | Tomate de árbol | *Solanum betaceum* |
| `arracacha` | Arracacha | *Arracacia xanthorrhiza* |
| `oca` | Oca | *Oxalis tuberosa* |
| `ulluco` | Ulluco / papa lisa | *Ullucus tuberosus* |
| `tarwi` | Tarwi / chocho | *Lupinus mutabilis* |
| `olivo` | Olivo | *Olea europaea* |
| `vid` | Vid | *Vitis vinifera* |
| `almendro` | Almendro | *Prunus dulcis* |
| `higuera` | Higuera | *Ficus carica* |
| `algarrobo_es` | Algarrobo europeo | *Ceratonia siliqua* |
| `veza` | Veza | *Vicia sativa* |
| `alcornoque` | Alcornoque | *Quercus suber* |
| `encina` | Encina | *Quercus ilex* |
| `lavanda` | Lavanda | *Lavandula angustifolia* |
| `garbanzo` | Garbanzo | *Cicer arietinum* |
| `lenteja` | Lenteja | *Lens culinaris* |
| `pistacho` | Pistacho | *Pistacia vera* |
| `damasco` | Damasco / albaricoque | *Prunus armeniaca* |
| `azafran` | Azafrán | *Crocus sativus* |
| `manzano` | Manzano | *Malus domestica* |
| `nogal` | Nogal | *Juglans regia* |
| `avellano` | Avellano | *Corylus avellana* |
| `trigo` | Trigo de invierno | *Triticum aestivum* |
| `papa` | Papa | *Solanum tuberosum* |
| `trebol_blanco` | Trébol blanco | *Trifolium repens* |
| `sauce_mimbre` | Sauce mimbre | *Salix viminalis* |
| `yerba_mate` | Yerba mate | *Ilex paraguariensis* |
| `naranjo` | Naranjo | *Citrus sinensis* |
| `durazno` | Durazno | *Prunus persica* |
| `cerezo` | Cerezo | *Prunus avium* |
| `avellano_chileno` | Avellano chileno | *Gevuina avellana* |
| `avena` | Avena | *Avena sativa* |
| `girasol` | Girasol | *Helianthus annuus* |
| `castano` | Castaño | *Castanea sativa* |
| `colza` | Colza | *Brassica napus* |
| `remolacha_azucarera` | Remolacha azucarera | *Beta vulgaris* |
| `lupulo` | Lúpulo | *Humulus lupulus* |
| `lino` | Lino | *Linum usitatissimum* |
| `raigras` | Raigrás perenne | *Lolium perenne* |
| `pecan` | Pecán | *Carya illinoinensis* |
| `arce_azucarero` | Arce azucarero | *Acer saccharum* |
| `centeno` | Centeno | *Secale cereale* |
| `cebada` | Cebada | *Hordeum vulgare* |
| `quinoa` | Quinoa | *Chenopodium quinoa* |
| `arandano` | Arándano | *Vaccinium corymbosum* |
| `aliso` | Aliso | *Alnus glutinosa* |
| `alforfon` | Alforfón / trigo sarraceno | *Fagopyrum esculentum* |
| `espino_amarillo` | Espino amarillo | *Hippophae rhamnoides* |
| `arroz_salvaje` | Arroz salvaje / manoomin | *Zizania palustris* |
| `datilera` | Palmera datilera | *Phoenix dactylifera* |
| `granado` | Granado | *Punica granatum* |
| `alfalfa` | Alfalfa | *Medicago sativa* |
| `algarrobo_ar` | Algarrobo criollo | *Prosopis alba* |
| `cebolla` | Cebolla | *Allium cepa* |
| `tamarugo` | Tamarugo | *Prosopis tamarugo* |
| `berseem` | Trébol de Alejandría (berseem) | *Trifolium alexandrinum* |
