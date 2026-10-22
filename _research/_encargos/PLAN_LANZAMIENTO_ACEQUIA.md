# Plan de lanzamiento y migración de Acequia

Fecha: 29 de agosto de 2026

## Decisiones ya tomadas

- Lanzamiento inicial mediante un piloto cerrado.
- Entre 6 y 10 participantes.
- Duración: 7 días.
- Un predio real por participante.
- La oferta inicial será únicamente el programa fundador.
- La landing tendrá como objetivo presentar la aplicación, no vender una suscripción todavía.
- La cobertura aspiracional es internacional, comunicada con detalle y confianza variables según la disponibilidad local.
- Dominio público: `acequia.app`.
- Aplicación: `app.acequia.app`.
- No hay usuarios ni suscripciones reales que deban migrarse.

## Arquitectura recomendada

### 1. Sitio público

`acequia.app`

Landing, metodología, casos reales, programa fundador, preguntas frecuentes, contacto y documentos legales públicos.

Conviene que sea un proyecto de Vercel independiente y liviano. Puede vivir dentro del monorepo actual, pero debe tener su propio proyecto y dominio para que la comunicación no dependa de los despliegues de la aplicación.

### 2. Aplicación

`app.acequia.app`

Se conecta al proyecto de Vercel que hoy publica `terreno.arteytierra.org`. No hace falta mover la base de datos ni reconstruir el SaaS. El nombre interno del proyecto puede cambiarse después; no afecta el dominio público.

Rutas principales:

- `/` redirige a `/login` o `/mapa` según la sesión.
- `/login`
- `/registro`
- `/mapa`
- `/suscribir`
- `/informe/[token]`
- `/terminos`
- `/privacidad`

### 3. Dominios anteriores

- `arteytierra.org/acequia`: durante el piloto puede conservar una presentación breve con enlace a `acequia.app`. En el lanzamiento público, redirección permanente a `acequia.app`.
- `terreno.arteytierra.org`: conservar durante la transición. Después de verificar autenticación, informes y pagos, redirigir cada ruta equivalente a `app.acequia.app` preservando ruta y parámetros.
- `www.acequia.app`: redirección permanente a `acequia.app`.

## Landing recomendada

### Primera pantalla

- Descriptor: Diseño ecosistémico del territorio.
- Titular: Entendé el territorio antes de intervenirlo.
- Explicación funcional inmediata.
- CTA principal: Conocer Acequia.
- CTA secundario: Piloto fundador.
- Imagen real de la plataforma.
- Aclaración breve de alcance profesional.

### Recorrido

1. Delimitá el predio.
2. Reuní la evidencia.
3. Diseñá con criterio.
4. Compartí el diagnóstico.

### Prueba del producto

- Captura de relieve y agua.
- Captura de sectores y sistemas.
- Ejemplo de informe compartible.
- Más adelante: un caso real antes/después.

### Metodología y confianza

Cada dato debe poder mostrar:

- fuente;
- fecha;
- resolución;
- tipo de evidencia;
- nivel de confianza;
- limitaciones;
- cobertura disponible para la ubicación.

La expresión recomendada es “cobertura internacional con detalle según disponibilidad local”. Evitar afirmar que funciona igual o con la misma precisión en todo el mundo.

### Público

- Diseño territorial.
- Agronomía y paisaje.
- Consultoría regenerativa.
- Pequeños estudios profesionales.

### Piloto fundador

- 6 a 10 participantes.
- 7 días.
- Un predio real por participante.
- Acceso sin cobro durante la prueba.
- Compromiso de completar las tareas y entregar feedback.
- Autorización opcional y separada para publicar el caso.
- Beneficio fundador a definir después de conocer intención real de pago; no prometer todavía un descuento vitalicio.

## Programa de siete días

### Antes del inicio

- Elegir participantes del público profesional primario.
- Confirmar que cada uno tenga un predio real y permiso para utilizarlo.
- Preparar consentimiento de uso, privacidad y autorización opcional para caso de estudio.
- Crear un canal único de soporte.
- Definir una versión congelada de la aplicación durante los siete días, salvo errores críticos.

### Día 1 — Inicio

- Presentación de 45 minutos.
- Registro e ingreso.
- Trazado del predio.
- Medición de tiempo hasta el primer resultado útil.

### Días 2 y 3 — Lectura

- Relieve, agua, clima, suelo y contexto.
- Registro de datos incorrectos, faltantes o difíciles de interpretar.
- Primera encuesta breve.

### Días 4 y 5 — Diseño

- Trazados y sectores.
- Preparación del diagnóstico preliminar.
- Reunión intermedia de 30 minutos.

### Día 6 — Entregable

- Generación y revisión del informe.
- Uso o presentación a una tercera persona cuando sea posible.

### Día 7 — Cierre

- Entrevista de 30 minutos.
- Intención de volver a usar.
- Intención de pago y precio percibido.
- Permiso separado para convertir el trabajo en caso público.

## Métricas mínimas del piloto

- Al menos 8 de cada 10 participantes completan el perímetro.
- Primer resultado útil en menos de 15 minutos.
- Al menos 6 de cada 10 llegan a un informe o entregable compartible.
- Al menos la mitad vuelve a entrar sin que se lo recuerden.
- Se registran los datos incorrectos con ubicación, fuente y efecto sobre el análisis.
- Se identifica qué tres funciones sostienen la intención de pago.
- No se produce ningún error crítico de autenticación, guardado o pérdida de trabajo.

## Migración técnica

### Fase A — Preparación

1. Crear el proyecto de landing y conectarlo a `acequia.app`.
2. Agregar `app.acequia.app` al proyecto actual del SaaS en Vercel.
3. Configurar en GoDaddy únicamente los registros que muestre Vercel para cada dominio.
4. Mantener los dominios anteriores activos.
5. Hacer una copia de seguridad de Supabase y documentar las variables actuales.

### Fase B — Aplicación

Actualizar:

- `NEXT_PUBLIC_SITE_URL=https://app.acequia.app`;
- URLs permitidas y de redirección en Supabase;
- enlaces de confirmación de correo y OAuth;
- CORS y origen propio de las APIs;
- URL generada para informes compartibles;
- textos impresos dentro del informe;
- identificadores de la aplicación enviados a fuentes externas;
- metadatos, términos, privacidad y correos transaccionales.

El checkout actualmente depende del sitio de Arte y Tierra. Puede conservarse así en la primera migración. No conviene mover autenticación, dominio y pagos al mismo tiempo.

### Fase C — Verificación obligatoria

Probar en `app.acequia.app`:

- registro con correo;
- confirmación del correo;
- ingreso y salida;
- ingreso con Google;
- recuperación de contraseña;
- guardado y recuperación de un proyecto;
- APIs territoriales;
- generación y apertura de un informe;
- Mercado Pago de principio a fin;
- PayPal de principio a fin;
- cancelación o error de pago;
- funcionamiento en móvil y escritorio.

Los pagos no deben considerarse listos hasta completar al menos una transacción controlada con cada proveedor y verificar el resultado en la base de datos.

### Fase D — Corte

1. Declarar `app.acequia.app` como dominio principal del SaaS.
2. Mantener `terreno.arteytierra.org` durante 7 a 14 días.
3. Comunicar el nuevo acceso a los participantes.
4. Activar redirecciones permanentes preservando rutas y parámetros.
5. Actualizar `arteytierra.org/acequia` para dirigir a `acequia.app`.

Como solo existen cuentas de prueba, no hace falta migrar sesiones. Las personas deberán ingresar nuevamente en el nuevo dominio.

## Secuencia general de avance

### Semana 1 — Preparación

- Aprobar landing y textos.
- Definir convocatoria y criterios de selección.
- Terminar correcciones críticas de datos y claims.
- Configurar dominios sin redirigir todavía.

### Semana 2 — Integración

- Publicar `acequia.app`.
- Habilitar `app.acequia.app`.
- Verificar autenticación, informes, correo y pagos.
- Preparar soporte y medición del piloto.

### Semana 3 — Piloto fundador

- Ejecutar los siete días.
- No incorporar funciones grandes durante la prueba.
- Resolver únicamente bloqueos críticos y registrar el resto.

### Semana 4 — Aprendizaje

- Ordenar feedback por gravedad y frecuencia.
- Publicar tres casos reales con permiso.
- Ajustar propuesta, onboarding, precios y alcance geográfico demostrado.
- Decidir si se abre una beta más amplia o se realiza un segundo piloto.

## Condiciones para abrir al mercado

- Tres casos reales publicados.
- Página de metodología y estado de datos.
- Pagos verificados de punta a punta.
- Recuperación de contraseña y correos transaccionales probados.
- Términos y privacidad actualizados con la nueva marca y dominios.
- Corrección de afirmaciones de precisión y alcance.
- Wordmark vectorizado o uso consistente de PNG aprobado.
- Canal de soporte y procedimiento para corregir datos.
- Copia de seguridad y procedimiento de respuesta ante incidentes.

## Decisión recomendada

No realizar una “gran mudanza” única. Primero publicar la landing, luego habilitar el nuevo subdominio sobre el mismo SaaS, probar autenticación y pagos, ejecutar el piloto y recién entonces retirar los dominios anteriores.
