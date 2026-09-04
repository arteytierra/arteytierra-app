# Variables de la vista previa del landing — lista por nombre

Derivada del código el 04/09/2026: `scripts/preflight.mjs`, `lib/site.ts`,
`lib/pilot-admin.ts` y las cuatro rutas de `app/api/` del proyecto
`acequia-landing-piloto`. **Ningún valor se escribe acá.** Todo se carga en el
entorno **Preview** de Vercel, nunca en Production.

## Las que hay que cargar

| Nombre | Alcance | Qué es |
| --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | público | Origen del landing, **sin ruta ni barra final**. En preview, la URL `*.vercel.app`. |
| `NEXT_PUBLIC_APP_URL` | público | Origen de la app. En preview, la URL `*.vercel.app` de `apps/terreno`. |
| `NEXT_PUBLIC_SUPABASE_URL` | público | URL del proyecto de Supabase. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | público | Clave anónima. |
| `SUPABASE_SERVICE_ROLE_KEY` | **privada** | Sólo la lee `lib/pilot-admin.ts`, que empieza con `import 'server-only'`. Verificado: no la toca ningún componente de cliente. |
| `PILOT_IP_HASH_SALT` | **privada** | Sal para no guardar direcciones IP en claro. Mínimo 32 caracteres. |
| `ANALYTICS_HASH_SALT` | **privada** | Sal de métricas. Mínimo 32 caracteres, **distinta** de la anterior. |
| `PILOT_ADMIN_EMAILS` | privada | Lista separada por comas; el preflight exige que cada entrada tenga `@`. |

Para generar cada sal, sin que el valor pase por un chat ni por un archivo del
repositorio:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))"
```

## Las que arrancan y terminan la sesión en `false`

`NEXT_PUBLIC_PAYMENTS_ENABLED`, `PAYMENT_WEBHOOKS_ENABLED`,
`EMAIL_DELIVERY_ENABLED`, `NEXT_PUBLIC_ALLOW_INDEXING`,
`NEXT_PUBLIC_PILOT_APPLICATIONS_ENABLED`, `NEXT_PUBLIC_PILOT_FEEDBACK_ENABLED`,
`NEXT_PUBLIC_ACCOUNT_REQUESTS_ENABLED`, `NEXT_PUBLIC_PRODUCT_ANALYTICS_ENABLED`,
`PILOT_ADMIN_ENABLED`.

Opcionales y vacías por ahora: `PILOT_NOTIFICATION_WEBHOOK_URL`,
`PILOT_NOTIFICATION_WEBHOOK_TOKEN`.

## La que **no** se carga todavía

`NEXT_PUBLIC_AUTH_COOKIE_DOMAIN`. Puesta en `.acequia.app` mientras se prueba
sobre una URL `vercel.app`, el navegador descarta la cookie de sesión y el login
falla sin ningún error visible. Se carga recién en el bloque 8, con el dominio
definitivo.

## Dos advertencias sobre el preflight

1. **Con el entorno vacío, `npm run preflight` dice OK.** Todas sus reglas son
   condicionales: exigen variables sólo si el interruptor correspondiente está
   en `true`. Verde no significa "está configurado", significa "no hay
   combinaciones contradictorias". Para que sirva de compuerta hay que correrlo
   con las variables de la preview ya cargadas (`vercel env pull`), no en seco.
2. `--production` agrega tres reglas más: HTTPS obligatorio, los orígenes
   exactos `https://acequia.app` y `https://app.acequia.app`, y
   `NEXT_PUBLIC_AUTH_COOKIE_DOMAIN=.acequia.app`. Esa variante corre en el
   bloque 8, no ahora.
