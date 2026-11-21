import { PROVEEDOR } from '@/lib/titular';

/**
 * Quién presta el Servicio, con nombre y CUIT.
 *
 * Va en /terminos y en /privacidad. Los datos salen de `lib/titular.ts`: acá no
 * se escribe ninguno, para que el día que cambie el proveedor no haya dos
 * páginas diciendo cosas distintas.
 */
export default function IdentificacionProveedor() {
  const esSociedad = PROVEEDOR.forma === 'sociedad';
  return (
    <dl className="space-y-1 rounded-xl border border-bone-200 bg-bone-50 p-4 text-sm leading-relaxed text-ink-700">
      <div className="flex flex-wrap gap-x-2">
        <dt className="font-medium text-ink-950">
          {esSociedad ? 'Razón social:' : 'Titular:'}
        </dt>
        <dd>{PROVEEDOR.razonSocial}</dd>
      </div>
      <div className="flex flex-wrap gap-x-2">
        <dt className="font-medium text-ink-950">Nombre comercial:</dt>
        <dd>{PROVEEDOR.nombreComercial}</dd>
      </div>
      {PROVEEDOR.cuit ? (
        <div className="flex flex-wrap gap-x-2">
          <dt className="font-medium text-ink-950">CUIT:</dt>
          <dd>{PROVEEDOR.cuit}</dd>
        </div>
      ) : null}
      <div className="flex flex-wrap gap-x-2">
        <dt className="font-medium text-ink-950">Domicilio:</dt>
        <dd>{PROVEEDOR.domicilio}</dd>
      </div>
      <div className="flex flex-wrap gap-x-2">
        <dt className="font-medium text-ink-950">Correo electrónico:</dt>
        <dd>
          <a href={`mailto:${PROVEEDOR.email}`} className="text-moss-700 underline">
            {PROVEEDOR.email}
          </a>
        </dd>
      </div>
    </dl>
  );
}
