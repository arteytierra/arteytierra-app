/**
 * Tipos para `leaflet-rotate` (no trae los suyos).
 *
 * El plugin parchea L.Map en tiempo de import: crea un `rotatePane` (tiles +
 * overlayPane, que es donde viven nuestros imageOverlay de análisis) al que le
 * aplica un `transform: rotate()`, y un `norotatePane` (marcadores, tooltips,
 * popups) que queda siempre derecho.
 */
declare module 'leaflet-rotate';

import 'leaflet';

declare module 'leaflet' {
  interface MapOptions {
    /** Habilita la rotación del mapa. Debe pasarse al construir el mapa. */
    rotate?: boolean;
    /** Rumbo inicial en grados (0 = norte arriba). */
    bearing?: number;
    /** Control de brújula del plugin. Usamos el nuestro. */
    rotateControl?: boolean | { closeOnZeroBearing?: boolean };
    /** Rotar con dos dedos en pantallas táctiles. */
    touchRotate?: boolean;
    /** Rotar arrastrando con Shift. Lo apagamos: Shift + central = paneo. */
    shiftKeyRotate?: boolean;
    /** Orientar el mapa según la brújula del dispositivo. */
    compassBearing?: boolean;
  }

  interface Map {
    /** Rumbo actual en grados (0–360). */
    getBearing(): number;
    /** Fija el rumbo en grados. Dispara el evento `rotate`. */
    setBearing(theta: number): void;
    /** Convierte un punto del contenedor a punto de la capa rotada. */
    rotatedPointToMapPanePoint(point: Point): Point;
    /** Convierte un punto de la capa rotada a punto del contenedor. */
    mapPanePointToRotatedPoint(point: Point): Point;
  }
}
