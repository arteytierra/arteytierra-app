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
--   4. Queda con plan Personal por 7 días. Al vencer, vuelve sola a Semilla.
--
-- ANTES DE PEGAR: confirmá que la URL del proyecto de Supabase abierto sea
-- https://ojlvflmqcyxdnvhbnhgp.supabase.co  — si no coincide, pará.
-- ============================================================

-- ─── 1. El código ───────────────────────────────────────────────────────────
-- `familia` lo hace excluyente con cualquier otro código de la misma familia:
-- nadie puede acumular dos pruebas de fundador, ni ahora ni más adelante.
--
-- 7 días de plan Personal, como quedó definido. El reloj arranca cuando la
-- persona canjea, no cuando vos creás el código: mandá el link cerca del
-- encuentro inicial, no antes, para que la semana le rinda entera.
INSERT INTO terreno.codigos (codigo, plan, dias, usos_max, activo, familia, nota)
VALUES ('FUNDADOR26', 'personal', 7, 10, true, 'piloto-fundador',
        'Programa fundador 2026: 6 a 10 participantes, sin costo ni tarjeta.')
ON CONFLICT (codigo) DO UPDATE
  SET plan     = EXCLUDED.plan,
      dias     = EXCLUDED.dias,
      usos_max = EXCLUDED.usos_max,
      activo   = EXCLUDED.activo,
      familia  = EXCLUDED.familia,
      nota     = EXCLUDED.nota;

-- ─── 2. Comprobación ────────────────────────────────────────────────────────
-- Tiene que devolver una fila: FUNDADOR26 · personal · 7 · 10 · 0 · true
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
