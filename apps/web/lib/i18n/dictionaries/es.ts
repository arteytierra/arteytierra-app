export const es = {
  nav: {
    home: 'Inicio',
    about: 'Nosotros',
    projects: 'Proyectos',
    courses: 'Cursos',
    immersion: 'Inmersión Viva',
    cosmetics: 'Biocosmética',
    ebooks: 'Ebooks',
    consult: 'Asesorías',
    lodging: 'Hospedaje',
    blog: 'Diario',
    contact: 'Contacto',
    account: 'Mi cuenta',
    login: 'Ingresar',
    logout: 'Cerrar sesión',
    cart: 'Carrito',
  },
  common: {
    save: 'Guardar',
    saving: 'Guardando…',
    saved: 'Guardado',
    cancel: 'Cancelar',
    continue: 'Continuar',
    back: 'Volver',
    loading: 'Cargando…',
    error: 'Error',
    required: 'Requerido',
    optional: 'Opcional',
    yes: 'Sí',
    no: 'No',
    search: 'Buscar',
    seeMore: 'Ver más',
    next: 'Siguiente',
    prev: 'Anterior',
  },
  cart: {
    empty: 'Tu carrito está vacío.',
    title: 'Carrito',
    subtotal: 'Subtotal',
    total: 'Total',
    discount: 'Descuento',
    coupon: 'Cupón',
    applyCoupon: 'Aplicar',
    checkout: 'Finalizar compra',
    remove: 'Quitar',
  },
  product: {
    addToCart: 'Agregar al carrito',
    buyNow: 'Comprar ahora',
    inStock: 'Disponible',
    outOfStock: 'Sin stock',
    nights: 'noches',
    perNight: 'por noche',
    guests: 'huéspedes',
    reserve: 'Reservar',
  },
  course: {
    continue: 'Continuar',
    review: 'Repasar',
    complete: 'Marcar como completa',
    completed: 'Completada',
    program: 'Programa',
    community: 'Comunidad',
    certificate: 'Mi certificado',
  },
  auth: {
    loginTitle: 'Ingresar',
    signupTitle: 'Crear cuenta',
    email: 'Email',
    password: 'Contraseña',
    forgotPassword: '¿Olvidaste tu contraseña?',
    magicLink: 'Enviarme link mágico',
    or: 'o',
    continueWithGoogle: 'Continuar con Google',
    noAccount: '¿No tenés cuenta?',
    hasAccount: '¿Ya tenés cuenta?',
  },
  push: {
    enable: 'Activar notificaciones',
    disable: 'Desactivar notificaciones',
    permissionDenied: 'Permiso denegado',
  },
  install: {
    title: 'Instalá Arte y Tierra',
    body: 'Acceso rápido a tus cursos y reservas. Sin store.',
    install: 'Instalar',
    later: 'Ahora no',
  },
} as const;

// Util: convierte tipos literales `as const` a sus tipos base (string -> string)
// para que en.ts y pt.ts puedan implementar Dict con traducciones distintas.
type Stringify<T> = T extends string
  ? string
  : T extends readonly (infer U)[]
    ? Stringify<U>[]
    : T extends object
      ? { [K in keyof T]: Stringify<T[K]> }
      : T;

export type Dict = Stringify<typeof es>;
