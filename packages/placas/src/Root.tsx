import { Composition } from 'remotion';

import { AperturaAcequia, esquemaApertura } from './composiciones/AperturaAcequia';
import { LowerThird, esquemaLowerThird } from './composiciones/LowerThird';
import { PlacaDato, esquemaPlacaDato } from './composiciones/PlacaDato';
import { FORMATOS, FPS } from './marca';

/**
 * El catálogo de placas. Cada `Composition` es una entrada del estudio y un
 * blanco de `remotion render`.
 *
 * Los textos de acá son los valores por defecto: en el render real se pasan con
 * `--props='{"bajada":"..."}'`, así que una placa nueva no necesita tocar código.
 */
export const Root: React.FC = () => {
  return (
    <>
      <Composition
        id="AperturaAcequia"
        component={AperturaAcequia}
        durationInFrames={FPS * 3}
        fps={FPS}
        {...FORMATOS.horizontal}
        schema={esquemaApertura}
        defaultProps={{ bajada: 'Leer el territorio antes de moverlo' }}
      />

      <Composition
        id="AperturaAcequiaVertical"
        component={AperturaAcequia}
        durationInFrames={FPS * 3}
        fps={FPS}
        {...FORMATOS.vertical}
        schema={esquemaApertura}
        defaultProps={{ bajada: 'Leer el territorio antes de moverlo' }}
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
    </>
  );
};
