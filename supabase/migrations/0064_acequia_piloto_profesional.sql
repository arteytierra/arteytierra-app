-- El piloto fundador pasa a ser Profesional por seis meses.
--
-- Decision de Jonatan del 23/11/2026. El codigo FUNDADOR26 daba plan Personal
-- por 7 dias: una semana alcanza para la devolucion que el piloto pide, y no
-- alcanza para lo unico que el piloto necesita de verdad, que es que alguien
-- lleve un predio real de punta a punta y vuelva a entrar en la epoca
-- siguiente. Un predio no se diseña en una semana: el calendario agricola, el
-- balance hidrico y el pastoreo se leen contra las estaciones.
--
-- Y pasa a Profesional, no a Personal, por dos razones concretas:
--   · diez proyectos en vez de dos, que es lo que hace falta para que un
--     profesional pruebe la herramienta sobre su cartera y no sobre un caso;
--   · el informe con marca propia, que es justamente lo que un consultor
--     entrega y, por lo tanto, lo que mejor se puede criticar.
--
-- Nadie lo canjeo todavia (usos = 0 al escribir esto), asi que se actualiza en
-- el lugar en vez de crear un codigo nuevo: el link que ya esta escrito en
-- _research/_encargos/PILOTO_CODIGO_ACCESO.sql sigue valiendo, y la familia
-- 'piloto-fundador' sigue impidiendo que alguien acumule dos pruebas de
-- fundador. Si alguien lo hubiera canjeado, esto no le toca nada: su
-- suscripcion ya esta escrita en terreno.suscripciones con su propia fecha.
--
-- Por que 180 dias. La columna cuenta dias corridos y `canjear_codigo` hace
-- `now() + (dias || ' days')::interval`. Seis meses de calendario son entre 181
-- y 184 dias segun el mes en que se canjee; se elige el redondo de 180 porque
-- un piloto no se mide en dias exactos y porque el numero tiene que poder
-- decirse en una frase.
--
-- El tope de proyectos no se toca: lo aplica terreno.limite_proyectos() leyendo
-- el plan, y para 'profesional' ya dice 10. La columna `fundador` tampoco: esa
-- es el permiso de las cuentas internas del estudio (migracion 0063) y un
-- participante del piloto no es una cuenta interna. Queda con provider
-- 'manual', sin tarjeta y sin cobro, y al vencer vuelve sola a Semilla.

UPDATE terreno.codigos
SET plan = 'profesional',
    dias = 180,
    nota = 'Programa fundador 2026: Profesional por seis meses, sin costo ni tarjeta. 6 a 10 participantes.'
WHERE codigo = 'FUNDADOR26';

-- Si el codigo no existiera (entorno nuevo armado desde el repo), se crea.
INSERT INTO terreno.codigos (codigo, plan, dias, usos_max, activo, familia, nota)
VALUES ('FUNDADOR26', 'profesional', 180, 10, true, 'piloto-fundador',
        'Programa fundador 2026: Profesional por seis meses, sin costo ni tarjeta. 6 a 10 participantes.')
ON CONFLICT (codigo) DO NOTHING;
