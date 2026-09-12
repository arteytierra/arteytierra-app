-- Las dos funciones que cuentan proyectos corrian sin search_path fijo.
--
-- Son SECURITY DEFINER: se ejecutan con los permisos de quien las creo, no de
-- quien dispara el trigger. Sin `SET search_path`, el search_path que manda es
-- el de la sesion que inserta, y ahi se resuelven los operadores y las funciones
-- sin esquema (now(), count(), los `=` y `>`). Quien pueda crear objetos en un
-- esquema que quede antes en esa lista puede hacer que el limite de proyectos
-- decida otra cosa.
--
-- Las tablas ya van calificadas, asi que fijar pg_catalog y public no cambia la
-- logica: solo cierra la puerta. Es el ultimo WARN de search_path que quedaba en
-- el advisor de Supabase.

ALTER FUNCTION terreno.limite_proyectos() SET search_path TO 'pg_catalog', 'public';
ALTER FUNCTION anteproyectos.limite_proyectos() SET search_path TO 'pg_catalog', 'public';
