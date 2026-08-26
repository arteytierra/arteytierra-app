import { describe, expect, it } from 'vitest';
import { esIdValido, idDesdeNombre, normalizarProyecto, resumirProyecto, VERSION_PROYECTO } from '@/lib/proyectos/tipos';

describe('idDesdeNombre', () => {
  it('convierte el nombre del proyecto en un nombre de archivo seguro', () => {
    expect(idDesdeNombre('José R. y Mdelmar — Aguas Buenas, PR')).toBe('jose-r-y-mdelmar-aguas-buenas-pr');
    expect(idDesdeNombre('Ñandú  del  Sur')).toBe('nandu-del-sur');
  });

  it('nunca deja escapar caracteres de ruta', () => {
    // El id termina siendo el nombre del archivo: un nombre de proyecto con
    // barras o puntos no puede convertirse en una ruta hacia otra carpeta.
    for (const nombre of ['../../etc/passwd', 'C:\\Windows\\System32', '.././..', 'proyecto/../otro']) {
      const id = idDesdeNombre(nombre);
      expect(esIdValido(id)).toBe(true);
      expect(id).not.toMatch(/[.\\/]/);
    }
  });

  it('da un id utilizable aunque el nombre no tenga ningún carácter válido', () => {
    const id = idDesdeNombre('※ ※ ※');
    expect(esIdValido(id)).toBe(true);
  });
});

describe('normalizarProyecto', () => {
  const valido = {
    version: VERSION_PROYECTO,
    id: 'casa-prueba',
    nombre: 'Casa de prueba',
    guardadoEn: '2026-08-24T12:00:00.000Z',
    lat: '18.25',
    lng: '-66.1',
    m2Objetivo: 90,
    ambientes: [{ id: 'estar', tipo: 'estar-cocina-comedor', cantidad: 1 }],
    parametros: { nivelAutoconstruccion: 'alto', modularidadEtapas: true, pesoIntegracionProductiva: 'alto', gradoGeometriaSagrada: 'marcado' },
    perfilesActivos: ['organico'],
    zonaSismica: true,
  };

  it('conserva un proyecto bien formado', () => {
    const p = normalizarProyecto(valido)!;
    expect(p.nombre).toBe('Casa de prueba');
    expect(p.perfilesActivos).toEqual(['organico']);
    expect(p.zonaSismica).toBe(true);
    expect(p.parametros.gradoGeometriaSagrada).toBe('marcado');
  });

  it('descarta lo que no es un proyecto', () => {
    for (const basura of [null, 42, 'texto', {}, { nombre: '   ' }, []]) {
      expect(normalizarProyecto(basura)).toBeNull();
    }
  });

  it('tolera archivos incompletos o editados a mano', () => {
    // Los JSON viven en una carpeta que Jonatan puede abrir y editar: un
    // archivo a medias tiene que abrirse con defaults, no romper la app.
    const p = normalizarProyecto({ nombre: 'Mínimo' })!;
    expect(p.id).toBe('minimo');
    expect(p.m2Objetivo).toBe(90);
    expect(p.perfilesActivos).toEqual(['fiel-cliente', 'organico', 'bioclimatico']);
    expect(p.ambientes).toEqual([]);
    expect(p.zonaSismica).toBe(false);
  });

  it('filtra perfiles inventados y ambientes sin id', () => {
    const p = normalizarProyecto({
      ...valido,
      perfilesActivos: ['organico', 'perfil-que-no-existe'],
      ambientes: [{ id: 'ok', tipo: 'dormitorio', cantidad: 1 }, { tipo: 'dormitorio' }, null],
    })!;
    expect(p.perfilesActivos).toEqual(['organico']);
    expect(p.ambientes).toHaveLength(1);
  });

  it('reemplaza un id inválido guardado en el archivo', () => {
    const p = normalizarProyecto({ ...valido, id: '../escape' })!;
    expect(esIdValido(p.id)).toBe(true);
    expect(p.id).toBe('casa-de-prueba');
  });
});

describe('resumirProyecto', () => {
  it('cuenta los ambientes por cantidad, no por fila del programa', () => {
    const p = normalizarProyecto({
      nombre: 'Casa',
      ambientes: [
        { id: 'd', tipo: 'dormitorio', cantidad: 3 },
        { id: 'b', tipo: 'bano', cantidad: 2 },
      ],
    })!;
    expect(resumirProyecto(p).ambientes).toBe(5);
  });
});
