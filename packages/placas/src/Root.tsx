import { Composition } from 'remotion';

import { AperturaAcequia, esquemaApertura } from './composiciones/AperturaAcequia';
import { AperturaAcequiaApp, esquemaAperturaApp } from './composiciones/AperturaAcequiaApp';
import { BandaBase, Fuente, esquemaFuente } from './composiciones/BandaPie';
import { LowerThird, esquemaLowerThird } from './composiciones/LowerThird';
import { PlacaCruce, esquemaCruce } from './composiciones/PlacaCruce';
import { PlacaDato, esquemaPlacaDato } from './composiciones/PlacaDato';
import { Titular, esquemaTitular } from './composiciones/Titular';
import {
  COLORES_GEN,
  GenLockup,
  GenWordmark,
  esquemaGenLockup,
  esquemaGenWordmark,
} from './generadores/Generadores';
import { FORMATOS, FPS } from './marca';

/**
 * El catálogo de placas. Cada `Composition` es una entrada del estudio y un
 * blanco de `remotion render`.
 *
 * Los textos de acá son los valores por defecto: en el render real se pasan con
 * `--props='{"bajada":"..."}'`, así que una placa nueva no necesita tocar código.
 */

/** La bajada de la marca. Un solo lugar: si cambia, cambia en todas las placas. */
const BAJADA = 'Plataforma de estudio, diseño y planificación ecosistémica';

/**
 * Los números del video de presentación, tal como los devolvió acequia sobre el
 * predio que se filmó: 31,15 ha en Burruyacu, Tucumán, clima Cwa.
 *
 * Están acá y no sueltos en la placa para que se vean todos juntos y se note si
 * alguno deja de coincidir con el metraje. Si se refilma con otro predio, se
 * cambian acá y las dos versiones —horizontal y vertical— salen iguales.
 */
const CRUCE = {
  lluviaMm: 134.4,
  tormenta: '10 años',
  suelo: 'Franco-arcilloso · grupo C',
  pendientePct: 21.5,
  cobertura: 'Bosque 100 %',
  cn: 73,
  escurreMm: 63.8,
  escurrePct: 47,
  volumenM3: 179787,
  cuencaHa: 282,
} as const;

export const Root: React.FC = () => {
  return (
    <>
      {/* Apertura sobre crema — el blanco cálido de la marca */}
      <Composition
        id="AperturaClara"
        component={AperturaAcequia}
        durationInFrames={FPS * 3}
        fps={FPS}
        {...FORMATOS.horizontal}
        schema={esquemaApertura}
        defaultProps={{ bajada: BAJADA, fondo: 'crema' as const }}
      />

      <Composition
        id="AperturaClaraVertical"
        component={AperturaAcequia}
        durationInFrames={FPS * 3}
        fps={FPS}
        {...FORMATOS.vertical}
        schema={esquemaApertura}
        defaultProps={{ bajada: BAJADA, fondo: 'crema' as const }}
      />

      {/* Apertura sobre el negro profundo, con el lockup blanco */}
      <Composition
        id="AperturaOscura"
        component={AperturaAcequia}
        durationInFrames={FPS * 3}
        fps={FPS}
        {...FORMATOS.horizontal}
        schema={esquemaApertura}
        defaultProps={{ bajada: BAJADA, fondo: 'oscuro' as const }}
      />

      <Composition
        id="AperturaOscuraVertical"
        component={AperturaAcequia}
        durationInFrames={FPS * 3}
        fps={FPS}
        {...FORMATOS.vertical}
        schema={esquemaApertura}
        defaultProps={{ bajada: BAJADA, fondo: 'oscuro' as const }}
      />

      {/* La misma, con el isotipo en el azul agua del original */}
      <Composition
        id="AperturaOscuraAzul"
        component={AperturaAcequia}
        durationInFrames={FPS * 3}
        fps={FPS}
        {...FORMATOS.horizontal}
        schema={esquemaApertura}
        defaultProps={{ bajada: BAJADA, fondo: 'oscuro-azul' as const }}
      />

      <Composition
        id="AperturaOscuraAzulVertical"
        component={AperturaAcequia}
        durationInFrames={FPS * 3}
        fps={FPS}
        {...FORMATOS.vertical}
        schema={esquemaApertura}
        defaultProps={{ bajada: BAJADA, fondo: 'oscuro-azul' as const }}
      />

      {/* Apertura del dominio: isotipo arriba, y al final aparece el .app */}
      <Composition
        id="AperturaApp"
        component={AperturaAcequiaApp}
        durationInFrames={FPS * 5}
        fps={FPS}
        {...FORMATOS.horizontal}
        schema={esquemaAperturaApp}
        defaultProps={{ bajada: BAJADA, fondo: 'oscuro' as const }}
      />

      <Composition
        id="AperturaAppVertical"
        component={AperturaAcequiaApp}
        durationInFrames={FPS * 5}
        fps={FPS}
        {...FORMATOS.vertical}
        schema={esquemaAperturaApp}
        defaultProps={{ bajada: BAJADA, fondo: 'oscuro' as const }}
      />

      <Composition
        id="AperturaAppClara"
        component={AperturaAcequiaApp}
        durationInFrames={FPS * 5}
        fps={FPS}
        {...FORMATOS.horizontal}
        schema={esquemaAperturaApp}
        defaultProps={{ bajada: BAJADA, fondo: 'crema' as const }}
      />

      <Composition
        id="AperturaAppClaraVertical"
        component={AperturaAcequiaApp}
        durationInFrames={FPS * 5}
        fps={FPS}
        {...FORMATOS.vertical}
        schema={esquemaAperturaApp}
        defaultProps={{ bajada: BAJADA, fondo: 'crema' as const }}
      />

      {/* ── El video de presentación ──────────────────────────────────────
          La banda es un PNG que se estira debajo de todo el montaje; el pie de
          fuente y los titulares son MOV con alfa que se apoyan encima. Ver
          _research/video-acequia/MONTAJE.md. */}
      <Composition
        id="BandaBase"
        component={BandaBase}
        durationInFrames={1}
        fps={FPS}
        {...FORMATOS.horizontal}
      />

      <Composition
        id="BandaBaseVertical"
        component={BandaBase}
        durationInFrames={1}
        fps={FPS}
        {...FORMATOS.vertical}
      />

      <Composition
        id="Fuente"
        component={Fuente}
        durationInFrames={FPS * 3}
        fps={FPS}
        {...FORMATOS.horizontal}
        schema={esquemaFuente}
        defaultProps={{ capa: 'Relieve', fuente: 'Copernicus GLO-30 · © DLR e.V.' }}
      />

      <Composition
        id="FuenteVertical"
        component={Fuente}
        durationInFrames={FPS * 3}
        fps={FPS}
        {...FORMATOS.vertical}
        schema={esquemaFuente}
        defaultProps={{ capa: 'Relieve', fuente: 'Copernicus GLO-30 · © DLR e.V.' }}
      />

      <Composition
        id="Titular"
        component={Titular}
        durationInFrames={FPS * 4}
        fps={FPS}
        {...FORMATOS.horizontal}
        schema={esquemaTitular}
        defaultProps={{
          texto: 'Un terreno cualquiera.',
          anclaje: 'derecha' as const,
          segundo: '',
        }}
      />

      <Composition
        id="TitularVertical"
        component={Titular}
        durationInFrames={FPS * 4}
        fps={FPS}
        {...FORMATOS.vertical}
        schema={esquemaTitular}
        defaultProps={{
          texto: 'Un terreno cualquiera.',
          anclaje: 'centro' as const,
          segundo: '',
        }}
      />

      <Composition
        id="PlacaCruce"
        component={PlacaCruce}
        durationInFrames={FPS * 12}
        fps={FPS}
        {...FORMATOS.horizontal}
        schema={esquemaCruce}
        defaultProps={{ ...CRUCE }}
      />

      <Composition
        id="PlacaCruceVertical"
        component={PlacaCruce}
        durationInFrames={FPS * 12}
        fps={FPS}
        {...FORMATOS.vertical}
        schema={esquemaCruce}
        defaultProps={{ ...CRUCE }}
      />

      <Composition
        id="LowerThird"
        component={LowerThird}
        durationInFrames={FPS * 5}
        fps={FPS}
        {...FORMATOS.horizontal}
        schema={esquemaLowerThird}
        defaultProps={{ nombre: 'Jonatan', rol: 'Arte y Tierra' }}
      />

      <Composition
        id="PlacaDato"
        component={PlacaDato}
        durationInFrames={FPS * 4}
        fps={FPS}
        {...FORMATOS.horizontal}
        schema={esquemaPlacaDato}
        defaultProps={{
          valor: 30,
          unidad: 'm',
          descripcion: 'La resolución del modelo de elevación con que trabaja acequia',
          fuente: 'Copernicus GLO-30',
          decimales: 0,
        }}
      />

      {/* Generadores de assets. No son placas: producen los PNG que se
          commitean en apps/terreno/public/marca/. Ver Generadores.tsx. */}
      <Composition
        id="GenLockup"
        component={GenLockup}
        durationInFrames={1}
        fps={FPS}
        width={1700}
        height={560}
        schema={esquemaGenLockup}
        defaultProps={{ colorIsotipo: COLORES_GEN.agua, colorTexto: COLORES_GEN.crema }}
      />

      <Composition
        id="GenWordmark"
        component={GenWordmark}
        durationInFrames={1}
        fps={FPS}
        width={2360}
        height={480}
        schema={esquemaGenWordmark}
        defaultProps={{ texto: 'acequia.app', color: COLORES_GEN.blanco }}
      />
    </>
  );
};
