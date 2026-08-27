/**
 * Isotipo de acequia — las curvas de nivel que dibujan la «a».
 *
 * Va inline y no como <img src="/marca/isotipo-*.svg"> por dos motivos:
 *
 * 1. Tema oscuro. `globals.css` invierte toda la interfaz con un filtro sobre
 *    <html> y lo cancela sobre `img` (para que el mapa, los tiles y las fotos
 *    no salgan invertidos). Un logo en <img> quedaba entonces en azul oscuro
 *    sobre fondo negro, ilegible. Inline se invierte junto con el resto de la
 *    interfaz, que es lo que corresponde: el logo acá es cromo, no contenido.
 * 2. Color. Pinta con `currentColor`, así que hereda el color del contexto
 *    —azul agua sobre fondo claro, crema sobre la banda oscura del rótulo— sin
 *    necesitar un archivo distinto por fondo ni hacks de `invert`.
 *
 * La geometría es la variante *favicon* del paquete de marca (dos anillos,
 * trazo 28) y no la del isotipo grande (cuatro anillos, trazo 10,5): a 20–28 px
 * el trazo fino cae por debajo del píxel y los cuatro anillos se empastan en
 * una mancha gris. Es la compensación óptica que trae la marca para tamaños
 * chicos, no una deformación.
 */

const ANILLOS = [
  'M218 43 C169 41 121 68 85 110 C52 149 46 202 62 250 C77 294 110 332 153 349 C186 362 213 361 236 341 C249 330 262 333 281 345 C304 359 328 346 340 321 C353 295 344 267 350 229 C356 186 348 143 325 104 C302 66 261 44 218 43 Z',
  'M225 126 C204 125 183 137 167 156 C152 174 150 197 157 218 C164 238 178 255 197 263 C211 269 223 267 233 258 C240 252 245 253 254 259 C265 266 277 260 283 248 C289 236 285 223 288 206 C290 188 287 169 277 152 C267 136 244 127 225 126 Z',
];

export function Isotipo({ className = '', label }: { className?: string; label?: string }) {
  return (
    <svg
      viewBox="0 0 420 420"
      className={className}
      {...(label ? { role: 'img', 'aria-label': label } : { 'aria-hidden': true })}
    >
      <g fill="none" stroke="currentColor" strokeWidth={28} strokeLinecap="round" strokeLinejoin="round">
        {ANILLOS.map(d => <path key={d} d={d} />)}
      </g>
    </svg>
  );
}
