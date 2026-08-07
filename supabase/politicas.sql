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
--
-- NO lleva `alter table realtime.messages enable row level security`. Esa
-- tabla es de Supabase —su dueño es `supabase_realtime_admin`— y el editor SQL
-- responde `42501: must be owner of table messages`. Tampoco hace falta: en
-- `realtime.messages` la RLS ya viene activada, que es justo por lo que sin
-- políticas no pasa nada por los canales.

-- --------------------------------------------------------------------------
-- Quién es el docente
-- --------------------------------------------------------------------------
--
-- Va como literal en las políticas y no como tabla porque §11 de
-- CONVENTIONS.md dice que no creamos tablas. Con un solo docente, un literal
-- es honesto; el día que haya dos, esto se convierte en una tabla de permitidos
-- y se cambian las políticas que lo mencionan.

-- --------------------------------------------------------------------------
-- Los tres canales
-- --------------------------------------------------------------------------
--
--   taller:{curso}:{sesion}              la pauta y la presencia
--   taller:{curso}:{sesion}:preguntas    lo que preguntan los alumnos
--   taller:{curso}:{sesion}:respuestas   lo que responden los alumnos
--
-- Los dos últimos son asimétricos a propósito: los alumnos ESCRIBEN y no LEEN.
-- Por eso el canal principal excluye explícitamente los otros dos en cada
-- política. Bastó que el batch 10 agregara `:respuestas` para que, sin esa
-- exclusión, quedara legible para todos — y una respuesta legible antes del
-- revelado es exactamente lo que hace que la pregunta deje de medir algo.

-- --------------------------------------------------------------------------
-- Canal de la pauta
-- --------------------------------------------------------------------------

-- Publicar la pauta: SOLO el docente.
--
-- Sin esto el canal queda abierto y cualquiera que averigüe el nombre del tema
-- puede mover la clase de sitio. Con veinte alumnos que no saben que existe es
-- un riesgo teórico, pero es de los que se descubren de la peor manera.
--
-- Ojo: "estar autenticado" NO alcanza. Auth es compartida con la aplicación
-- `gen`, así que un usuario de `gen` está autenticado también acá.
--
-- La condición sobre `extension` es la que hace que esto no rompa la
-- presencia: en `realtime.messages` un broadcast y un anuncio de presencia son
-- los dos un INSERT, y sin distinguirlos, cerrar el canal al docente dejaría a
-- los alumnos sin poder anunciarse — y con ellos se iría el denominador de
-- "respondieron todos", que sale de Presence.
create policy "solo el docente publica la pauta"
  on realtime.messages
  for insert
  to authenticated
  with check (
    realtime.topic() like 'taller:%'
    and realtime.topic() not like '%:preguntas'
    and realtime.topic() not like '%:respuestas'
    and extension = 'broadcast'
    and auth.uid() = '74e0ae34-604b-4e92-92c4-65955503d653'::uuid
  );

-- Anunciarse: cualquiera.
--
-- Es lo que cuenta a los conectados. No lleva contenido de nadie: solo dice
-- que hay una pantalla más mirando.
create policy "cualquiera anuncia su presencia"
  on realtime.messages
  for insert
  to anon, authenticated
  with check (
    realtime.topic() like 'taller:%'
    and realtime.topic() not like '%:preguntas'
    and realtime.topic() not like '%:respuestas'
    and extension = 'presence'
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
    and realtime.topic() not like '%:respuestas'
  );

-- --------------------------------------------------------------------------
-- Canal de preguntas
-- --------------------------------------------------------------------------
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
-- Canal de respuestas
-- --------------------------------------------------------------------------
--
-- La misma asimetría, y por una razón más fuerte todavía: ver las respuestas
-- de los demás antes del revelado cambia las propias, y entonces la pregunta
-- ya no mide lo que quería medir (CONVENTIONS.md §12).
--
-- El recuento que se proyecta no sale de acá: lo arma el docente y lo publica
-- por el canal principal cuando decide revelar.

create policy "cualquiera responde"
  on realtime.messages
  for insert
  to anon, authenticated
  with check (realtime.topic() like 'taller:%:respuestas');

create policy "solo el docente lee las respuestas"
  on realtime.messages
  for select
  to authenticated
  using (
    realtime.topic() like 'taller:%:respuestas'
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
-- Deben salir SIETE.
--
-- Si hay que volver a empezar:
--
-- drop policy if exists "solo el docente publica la pauta"   on realtime.messages;
-- drop policy if exists "cualquiera anuncia su presencia"    on realtime.messages;
-- drop policy if exists "cualquiera sigue la pauta"          on realtime.messages;
-- drop policy if exists "cualquiera pregunta"                on realtime.messages;
-- drop policy if exists "solo el docente lee las preguntas"  on realtime.messages;
-- drop policy if exists "cualquiera responde"                on realtime.messages;
-- drop policy if exists "solo el docente lee las respuestas" on realtime.messages;
