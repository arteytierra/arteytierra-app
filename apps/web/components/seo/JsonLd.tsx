/**
 * Embebe un JSON-LD inline (script type="application/ld+json").
 * Server Component — sin JS de cliente.
 */
export function JsonLd({ data }: { data: object | object[] }) {
  return (
    <script
      type="application/ld+json"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(Array.isArray(data) ? data : [data]).replace(/</g, '\\u003c'),
      }}
    />
  );
}
