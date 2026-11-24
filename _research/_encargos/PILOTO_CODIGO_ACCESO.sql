-- ============================================================
-- Piloto fundador: código de acceso para la gente ya anotada.
--
-- Este camino NO toca pagos: `canjear_codigo` da de alta la suscripción con
-- provider 'manual', sin tarjeta y sin checkout. No depende de
-- ACEQUIA_PAYMENTS_ENABLED, ni de NEXT_PUBLIC_PAYMENTS_ENABLED, ni de la
-- revisión legal. Funciona hoy.
--
-- Cómo lo usa la persona:
--   1. Le mandás el código por correo.
--   2. Entra a  https://terreno.arteytierra.org/canjear?codigo=FUNDADOR26
--   3. Si no tiene cuenta, la crea ahí mismo (así queda su contacto) y vuelve.
--   4. Queda con plan Profesional por 180 días. Al vencer, vuelve sola a Semilla.
--
-- ANTES DE PEGAR: confirmá que la URL del proyecto de Supabase abierto sea
-- https://ojlvflmqcyxdnvhbnhgp.supabase.co  — si no coincide, pará.
-- ============================================================

-- ─── 1. El código ───────────────────────────────────────────────────────────
-- `familia` lo hace excluyente con cualquier otro código de la misma familia:
-- nadie puede acumular dos pruebas de fundador, ni ahora ni más adelante.
--
-- Desde el 23/11/2026 son 180 días de plan PROFESIONAL (antes eran 7 de
-- Personal). Seis meses porque un predio no se diseña en una semana: el
-- calendario agrícola, el balance hídrico y el pastoreo se leen contra las
-- estaciones, y la devolución que vale es la de alguien que volvió a entrar en
-- la época siguiente. Y Profesional porque son diez proyectos en vez de dos
-- —una cartera, no un caso— y porque trae el informe con marca propia, que es
-- justamente lo que un consultor entrega y, por lo tanto, lo que mejor puede
-- criticar.
--
-- Esto ya está escrito como migración 0064 en el repositorio: si la 0064 se
-- aplicó, este bloque no hace falta y no cambia nada (es idempotente).
--
-- El reloj arranca cuando la persona canjea, no cuando vos creás el código.
INSERT INTO terreno.codigos (codigo, plan, dias, usos_max, activo, familia, nota)
VALUES ('FUNDADOR26', 'profesional', 180, 10, true, 'piloto-fundador',
        'Programa fundador 2026: Profesional por seis meses, sin costo ni tarjeta. 6 a 10 participantes.')
ON CONFLICT (codigo) DO UPDATE
  SET plan     = EXCLUDED.plan,
      dias     = EXCLUDED.dias,
      usos_max = EXCLUDED.usos_max,
      activo   = EXCLUDED.activo,
      familia  = EXCLUDED.familia,
      nota     = EXCLUDED.nota;

-- ─── 2. Comprobación ────────────────────────────────────────────────────────
-- Tiene que devolver una fila: FUNDADOR26 · profesional · 180 · 10 · 0 · true
SELECT codigo, plan, dias, usos_max, usos, activo, familia
FROM terreno.codigos
WHERE familia = 'piloto-fundador';

-- ─── 3. Para seguir el piloto ───────────────────────────────────────────────
-- Quién lo canjeó y cuándo. Correlo cuando quieras ver cómo va el cupo.
SELECT c.ts, u.email
FROM terreno.codigos_canjeados c
JOIN auth.users u ON u.id = c.user_id
WHERE c.codigo = 'FUNDADOR26'
ORDER BY c.ts DESC;

-- ─── 4. Para cerrar el piloto ───────────────────────────────────────────────
-- No borra a nadie: quien ya canjeó conserva sus días. Sólo impide canjes nuevos.
-- UPDATE terreno.codigos SET activo = false WHERE codigo = 'FUNDADOR26';
