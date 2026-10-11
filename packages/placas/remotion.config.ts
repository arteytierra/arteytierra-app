import { Config } from '@remotion/cli/config';

/**
 * Los logos NO se copian acá: `publicDir` apunta a la carpeta de marca de
 * terreno, que es la única copia del paquete de marca en el repo. Duplicarlos
 * sería garantizar que algún día las dos copias digan cosas distintas.
 *
 * En las composiciones se usan con `staticFile('marca/logo-color.png')`.
 */
Config.setPublicDir('../../apps/terreno/public');

Config.setVideoImageFormat('jpeg');
// Las placas van sobre metraje o sobre fondo plano; el canal alfa se pide
// explícitamente al renderizar (`--codec=prores --prores-profile=4444`).
Config.setCodec('h264');
Config.setCrf(18);
