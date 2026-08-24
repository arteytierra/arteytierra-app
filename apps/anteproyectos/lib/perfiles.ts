import type { PerfilId } from './tipos';

export interface DefinicionPerfil {
  id: PerfilId;
  nombre: string;
  resumen: string;
  /** Aspecto de edificio (ancho/profundo) por defecto si el perfil no deriva la forma del clima. */
  aspectoDefault: number;
}

export const PERFILES: Record<PerfilId, DefinicionPerfil> = {
  'fiel-cliente': {
    id: 'fiel-cliente',
    nombre: 'Fiel al cliente, optimizado',
    resumen:
      'Punto de partida: el dibujo libre y el "día en la casa" del cuaderno. ' +
      'Se corrige técnicamente (circulaciones, cumplimiento del programa, ' +
      'cotas reales) manteniendo la intención espacial original.',
    aspectoDefault: 1.15,
  },
  organico: {
    id: 'organico',
    nombre: 'Orgánico, curvo, conectado al exterior',
    resumen:
      'Geometrías curvas, galerías y aberturas amplias hacia el paisaje, ' +
      'trazado regulador de geometría sagrada. Prioriza experiencia sensorial ' +
      'sobre eficiencia constructiva estricta.',
    aspectoDefault: 1.0,
  },
  bioclimatico: {
    id: 'bioclimatico',
    nombre: 'Bioclimático de máxima eficiencia',
    resumen:
      'Forma y orientación derivadas del análisis climático del sitio ' +
      '(Köppen, trayectoria solar, vientos). Principios Passive House ' +
      'adaptados al clima real del terreno.',
    aspectoDefault: 1.0, // se sobrescribe con la estrategia climática
  },
  autoconstruccion: {
    id: 'autoconstruccion',
    nombre: 'Autoconstrucción por etapas',
    resumen:
      'Mismo programa fraccionado en módulos independientes y habitables, ' +
      'según el capital experiencial/social relevado en el cuaderno.',
    aspectoDefault: 1.15,
  },
};
