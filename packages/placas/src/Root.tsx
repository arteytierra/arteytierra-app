import { Composition } from 'remotion';

import { AperturaAcequia, esquemaApertura } from './composiciones/AperturaAcequia';
import { AperturaAcequiaApp, esquemaAperturaApp } from './composiciones/AperturaAcequiaApp';
import { BandaBase, Fuente, esquemaFuente } from './composiciones/BandaPie';
import { LowerThird, esquemaLowerThird } from './composiciones/LowerThird';
import { PlacaCruce, esquemaCruce } from './composiciones/PlacaCruce';
import { CUADROS_PORTADA, PortadaAcequia, esquemaPortada } from './composiciones/PortadaAcequia';
import {
  CUADROS_LECTURA, FPS_LECTURA, LecturaPredio, esquemaLectura,
} from './composiciones/LecturaPredio';
import { CUADROS_LAZO, LazoPredio, esquemaLazo } from './composiciones/LazoPredio';
import { CUADROS_MESA, MesaDeTrabajo } from './composiciones/MesaDeTrabajo';
import { CUADROS_PAR, ParCrudoLeido } from './composiciones/ParCrudoLeido';
import { PlacaDato, esquemaPlacaDato } from './composiciones/PlacaDato';
import {
  CUADROS_PORTADA_PREDIO, PortadaPredio, esquemaPortadaPredio,
} from './composiciones/PortadaPredio';
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
        defaultProps={{ bajada: BAJADA, fondo: 'oscuro' as const, ritmo: 1 }}
      />

      <Composition
        id="AperturaAppVertical"
        component={AperturaAcequiaApp}
        durationInFrames={FPS * 5}
        fps={FPS}
        {...FORMATOS.vertical}
        schema={esquemaAperturaApp}
        defaultProps={{ bajada: BAJADA, fondo: 'oscuro' as const, ritmo: 1 }}
      />

      <Composition
        id="AperturaAppClara"
        component={AperturaAcequiaApp}
        durationInFrames={FPS * 5}
        fps={FPS}
        {...FORMATOS.horizontal}
        schema={esquemaAperturaApp}
        defaultProps={{ bajada: BAJADA, fondo: 'crema' as const, ritmo: 1 }}
      />

      <Composition
        id="AperturaAppClaraVertical"
        component={AperturaAcequiaApp}
        durationInFrames={FPS * 5}
        fps={FPS}
        {...FORMATOS.vertical}
        schema={esquemaAperturaApp}
        defaultProps={{ bajada: BAJADA, fondo: 'crema' as const, ritmo: 1 }}
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
        defaultProps={{ ...CRUCE, ritmo: 1 }}
      />

      <Composition
        id="PlacaCruceVertical"
        component={PlacaCruce}
        durationInFrames={FPS * 12}
        fps={FPS}
        {...FORMATOS.vertical}
        schema={esquemaCruce}
        defaultProps={{ ...CRUCE, ritmo: 1 }}
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

      {/*
        La portada de acequia.app. No es una placa de marca: es la unica
        composicion que dibuja datos de un predio real, y por eso se renderiza
        aparte y con cuidado:

          pnpm --filter @arteytierra/placas portada

        El `--gl=angle` es porque MapLibre es WebGL y el Chrome de Remotion
        arranca sin aceleracion. El `--concurrency=1`, porque varias pestanias
        peleando por las mismas teselas devuelven cuadros en blanco.
      */}
      <Composition
        id="PortadaAcequia"
        component={PortadaAcequia}
        durationInFrames={CUADROS_PORTADA}
        fps={FPS}
        /*
          720p y no 1080p, y es una decisión del contrato, no una comodidad: el
          techo de peso de la portada son 2,5 MB para catorce segundos, o sea
          ~1,4 Mbps. A ese caudal, 1080p obliga a un bitrate que bandea los
          degradados del shader de elevación, que es justo lo que hay que ver.
          Si el degradado bandea, baja la resolución antes que el bitrate.
        */
        width={1280}
        height={720}
        schema={esquemaPortada}
        defaultProps={{ exageracion: 1.4, atribucion: true }}
      />

      {/*
        Las tres piezas del encargo 02, todas sobre el mismo predio y el mismo
        encuadre a sangre. Las tres en 1280×720 por la misma razón que la
        portada vieja: a este caudal de bits, 1080p bandea antes de lo que gana
        en detalle, y la regla del contrato es bajar la resolución antes que el
        bitrate.
      */}
      <Composition
        id="PortadaPredio"
        component={PortadaPredio}
        durationInFrames={CUADROS_PORTADA_PREDIO}
        fps={FPS}
        width={1280}
        height={720}
        schema={esquemaPortadaPredio}
        defaultProps={{}}
      />

      {/*
        Las seis lecturas: dos segundos, una vuelta entera y 60 fps. Los 60 no
        son un lujo: 360° en dos segundos son 180° por segundo, que a 30 fps
        dan 6° por cuadro y el giro estroboscopia. Ver la cabecera de la
        composición.
      */}
      {(['relieve', 'curvas', 'agua', 'represas', 'todo', 'secuencia'] as const).map(lectura => (
        <Composition
          key={lectura}
          id={`Lectura${lectura[0]!.toUpperCase()}${lectura.slice(1)}`}
          component={LecturaPredio}
          durationInFrames={CUADROS_LECTURA}
          fps={FPS_LECTURA}
          width={1280}
          height={720}
          schema={esquemaLectura}
          defaultProps={{ lectura }}
        />
      ))}

      {/*
        Los tres lazos son la misma composición con una propiedad distinta: el
        mapa, el encuadre y las trampas de MapLibre son los mismos, y tres
        archivos que comparten doscientas líneas se desincronizan el día que se
        arregla una.
      */}
      {(['perimetro', 'giro', 'agua'] as const).map(lazo => (
        <Composition
          key={lazo}
          id={`Lazo${lazo[0]!.toUpperCase()}${lazo.slice(1)}`}
          component={LazoPredio}
          durationInFrames={CUADROS_LAZO}
          fps={FPS}
          width={1280}
          height={720}
          schema={esquemaLazo}
          defaultProps={{ lazo }}
        />
      ))}

      {/*
        El encargo 03: la secuencia de la mesa de trabajo. Dieciséis segundos,
        cámara quieta, bucle perfecto. Es la única de todas en la que el primer
        y el último cuadro SÍ son idénticos, y la razón está en la cabecera de
        la composición: donde nada se mueve, periódico e idéntico son lo mismo.
      */}
      <Composition
        id="MesaDeTrabajo"
        component={MesaDeTrabajo}
        durationInFrames={CUADROS_MESA}
        fps={FPS}
        width={1280}
        height={720}
        defaultProps={{}}
      />

      {/*
        La entrega C: el par crudo contra leído, para la cortina. Son DOS
        cuadros de la misma composición y no dos imágenes sueltas, porque
        «alineadas al píxel» no se consigue pidiendo dos veces la misma cámara
        —dos renders son dos mapas y dos cargas de teselas— sino no moviéndola.
        1600 × 900, que es lo que pide el encargo.
      */}
      <Composition
        id="ParCrudoLeido"
        component={ParCrudoLeido}
        durationInFrames={CUADROS_PAR}
        fps={FPS}
        width={1600}
        height={900}
        defaultProps={{}}
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
