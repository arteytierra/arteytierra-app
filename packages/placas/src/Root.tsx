import { Composition } from 'remotion';

import { AperturaAcequia, esquemaApertura } from './composiciones/AperturaAcequia';
import { AperturaAcequiaApp, esquemaAperturaApp } from './composiciones/AperturaAcequiaApp';
import { LowerThird, esquemaLowerThird } from './composiciones/LowerThird';
import { PlacaDato, esquemaPlacaDato } from './composiciones/PlacaDato';
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
