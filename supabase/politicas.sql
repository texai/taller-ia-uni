-- Políticas de Realtime para el taller.
--
-- Corre esto una vez en el editor SQL del proyecto. NO crea tablas nuestras:
-- `realtime.messages` es de Supabase, y estas políticas solo dicen quién puede
-- publicar y quién puede leer en nuestros canales.
--
-- Antes de esto, en el panel:
--   1. Database → Replication → habilitar Realtime en el proyecto
--   2. Authentication → Providers → Email → registro DESHABILITADO
--   3. Authentication → Users → crear el usuario del docente
--
-- Reemplaza el identificador de abajo por el `uuid` de ese usuario, el mismo
-- que va en NEXT_PUBLIC_DOCENTE_UID.

-- --------------------------------------------------------------------------
-- Quién es el docente
-- --------------------------------------------------------------------------
--
-- Va como literal en las políticas y no como tabla porque §11 de
-- CONVENTIONS.md dice que no creamos tablas. Con un solo docente, un literal
-- es honesto; el día que haya dos, esto se convierte en una tabla de permitidos
-- y se cambian las tres políticas.

-- --------------------------------------------------------------------------
-- Canal de la pauta:  taller:{curso}:{sesion}
-- --------------------------------------------------------------------------

alter table realtime.messages enable row level security;

-- Publicar la pauta: SOLO el docente.
--
-- Sin esto el canal queda abierto y cualquiera que averigüe el nombre del tema
-- puede mover la clase de sitio. Con veinte alumnos que no saben que existe es
-- un riesgo teórico, pero es de los que se descubren de la peor manera.
--
-- Ojo: "estar autenticado" NO alcanza. Auth es compartida con la aplicación
-- `gen`, así que un usuario de `gen` está autenticado también acá.
create policy "solo el docente publica la pauta"
  on realtime.messages
  for insert
  to authenticated
  with check (
    realtime.topic() like 'taller:%'
    and realtime.topic() not like '%:preguntas'
    and auth.uid() = '74e0ae34-604b-4e92-92c4-65955503d653'::uuid
  );

-- Leer la pauta: cualquiera, incluso sin autenticarse.
--
-- Es el punto del producto: el alumno entra con la URL y nada más.
create policy "cualquiera sigue la pauta"
  on realtime.messages
  for select
  to anon, authenticated
  using (
    realtime.topic() like 'taller:%'
    and realtime.topic() not like '%:preguntas'
  );

-- --------------------------------------------------------------------------
-- Canal de preguntas:  taller:{curso}:{sesion}:preguntas
-- --------------------------------------------------------------------------
--
-- Asimétrico a propósito: los alumnos ESCRIBEN y no LEEN.
--
-- La mitad del valor de poder preguntar es que nadie más te vea preguntarlo.
-- Si los alumnos pudieran leer este canal, cualquiera con las herramientas de
-- desarrollador abiertas vería quién preguntó qué — y quien pregunta desde el
-- anonimato dejaría de hacerlo.

create policy "cualquiera pregunta"
  on realtime.messages
  for insert
  to anon, authenticated
  with check (realtime.topic() like 'taller:%:preguntas');

create policy "solo el docente lee las preguntas"
  on realtime.messages
  for select
  to authenticated
  using (
    realtime.topic() like 'taller:%:preguntas'
    and auth.uid() = '74e0ae34-604b-4e92-92c4-65955503d653'::uuid
  );

-- --------------------------------------------------------------------------
-- Comprobar que quedó bien
-- --------------------------------------------------------------------------
--
-- select policyname, cmd, roles
--   from pg_policies
--  where schemaname = 'realtime' and tablename = 'messages';
--
-- Deben salir cuatro.
