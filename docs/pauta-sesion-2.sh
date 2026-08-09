#!/usr/bin/env zsh
# =============================================================================
#  PAUTA DE COMANDOS · SESIÓN 2 · domingo 9 de agosto de 2026, 09:00–13:00
#  Taller 02 de caso aplicado de IA en industria · Ernesto Anaya · UNI
# =============================================================================
#
#  ESTO NO SE EJECUTA ENTERO. Es una pauta: se copia un bloque a la vez y se
#  mira la salida entre uno y otro. Corrida de un tirón rompe y repara el
#  mundo seis veces sin que nadie lea nada.
#
#  Es la sesión 2 sola. El sábado llegó hasta el final del reto 1, así que
#  hoy entran **los retos 2, 3, 4 y 5** más el cierre. La pauta completa de
#  las dos sesiones sigue en `pauta-de-comandos.sh`.
#
#  ---------------------------------------------------------------------------
#  CÓMO SE LEE
#
#      # sonda · antes        el estado ANTES, para poder comparar
#      <comando>  # <- id     lo que se dicta, y EN QUÉ LÁMINA sale
#      # sonda · despues      LA MISMA LÍNEA, para ver qué cambió
#      # 💼 NEGOCIO           qué gana o qué pierde la cadena de retail
#
#  La marca lleva **el número de lámina** y el identificador. El número es el
#  que sirve para moverse: se teclea en el salto rápido del mando y la clase
#  entera va ahí. El identificador está detrás porque no cambia nunca, y el
#  número sí — la sesión tiene 143 láminas hoy, y si mañana entra una en
#  medio, todos los de después corren uno.
#
#  Para regenerarlos:  npm run numerar-pauta
#
#  El 💼 es lo que esta pauta añade sobre la otra. Un comando produce números,
#  y los números no deciden nada solos: «sesgo +4.8%» es una cifra hasta que
#  alguien dice **37,297 unidades de más en almacén**. Esa traducción es la
#  que la sala deja de hacer sola a media mañana.
#
#  Marcas:   ⏱ tarda    🔑 gasta llave de LLM    ⚠️ cuidado
#
#  OJO CON EL 🔑. Con `PROVEEDOR_LLM=mock` esos bloques corren y terminan en
#  verde, pero el agente devuelve `sin_hallazgos`: no recomienda nada, no
#  ejecuta nada, y las sondas dan lo mismo antes y después. No es que fallen;
#  es que sin llave no hay diagnóstico. Comprobado.
#
#  ---------------------------------------------------------------------------
#  DESDE DÓNDE SE CORRE
#
#      cd ~/ruta/a/taller-ia-uni-lab
#
#  En Windows: `.\taller.ps1 <tarea>`, con el mismo nombre detrás.
#
#  ---------------------------------------------------------------------------
#  LOS CUATRO NÚMEROS, MEDIDOS
#
#  Toda la sesión se lee contra esta tabla. Sale de sembrar el mundo desde
#  cero y correr `make senales` sobre cada escenario. Medido dos veces, con
#  siembras de días distintos:
#
#      mundo               modelos   MAPE    sesgo    sobre umbral   uds. de mas
#      sano                  192     13.8%   +0.7%    10 de 192      5,717 / 6,569
#      sesgo_silencioso      192     14.5%   +4.7%    16 de 192     36,986 / 37,297
#      feed_caido            184     13.8%   +0.8%     9 de 184      5,842 / 6,431
#
#  La fila del medio y la de abajo son las dos formas de romperse que enseña
#  el taller: **una se ve en el sesgo y no en el MAPE; la otra no se ve en
#  ninguno de los dos y solo se delata en el denominador.**
#
#  ⚠️ LAS UNIDADES DE MÁS SE MUEVEN CON LA FECHA, y las otras cuatro columnas
#  no. El mundo se genera contra `date.today()`, así que la ventana de 14 días
#  cae sobre otros días según cuándo se sembró: dos siembras con un día de
#  diferencia dieron 5,717 y 6,569 sobre el mismo mundo sano. **MAPE, sesgo,
#  denominador y conteo aguantan; la cifra de unidades, no.**
#
#  Por eso en clase se lee la PROPORCIÓN y no el número: el sesgo silencioso
#  multiplica las unidades de más por unas seis veces y media, y multiplica el
#  sesgo por seis o siete. Eso es lo que se repite siempre. Si a alguien le
#  sale otra cifra, que compare la proporción.
# =============================================================================

if [[ "${ZSH_EVAL_CONTEXT:-}" == *:file:* || "${BASH_SOURCE[0]:-}" == "$0" ]]; then
  cat >&2 <<'FIN'

  Esta pauta no se ejecuta entera.

  Rompería y repararía el mundo seis veces seguidas sin que nadie mire nada.
  Ábrela y copia un bloque a la vez.

FIN
  exit 1
fi


# ═════════════════════════════════════════════════════════════════════════════
#  ANTES DE LA CLASE · 08:30, no delante de la sala
# ═════════════════════════════════════════════════════════════════════════════

# ── preparación · entorno en pie y mundo sano ────────────────────────────────
# id: — preparación
# estado de partida: lo que quedara del sábado · deja el mundo: SANO

# sonda · antes
docker compose ps
#   → si no hay nada, o si algo falla con «network ... not found»:
#     ⚠️ `docker compose --profile mlflow --profile local down` y volver.
#     `down` a secas NO se lleva los servicios con perfil, y el contenedor
#     viejo de mlflow queda apuntando a una red que ya no existe.

make arriba                        # ⏱ ~1 min si las imágenes ya están
make reparar                       # ⏱ ~40 s

# sonda · despues
make senales
#   → 13.8 / +0.7 / 10 de 192 · ~5,700 unidades de mas
#   ⚠️ si no da esto, algo quedó roto del sábado. `make reset` y `make seed`.

# 💼 NEGOCIO: punto de partida. La cadena tiene 192 modelos pronosticando
#    demanda con un 13.8% de error medio y prácticamente sin sesgo. No hay
#    nada que arreglar: es el mundo contra el que se van a medir las averías
#    de las próximas cuatro horas.

# deja el mundo: SANO


# ═════════════════════════════════════════════════════════════════════════════
#  APERTURA · 09:00
# ═════════════════════════════════════════════════════════════════════════════

# ── S2·U1 · el repaso de pandas del reto 1 ───────────────────────────────────
# id: 5 s2-repaso-pandas
# estado de partida: SANO · deja el mundo: SANO
#
# No se dicta: se proyecta por si alguien quiere reproducir el reto 1, o para
# quien no vino ayer. Los dos bloques van con su botón de copiar en la lámina.

# sonda · antes
make senales
#   → 13.8 / +0.8 / 10 de 192

make romper ESCENARIO=campana_promocional   # ← lámina 5 · s2-repaso-pandas · ⏱ ~40 s
make consola                                # ← lámina 5 · s2-repaso-pandas
#   → se pegan los dos bloques de la lámina:
#     bloque 1 · bebidas 31.6 / −33.7, y las otras siete entre 11.9 y 15.4
#     bloque 2 · chorrillos 59.9 · magdalena 49.6 · jesus-maria 48.0
#   ⚠️ el segundo bloque necesita el `u` del primero. Pegado solo da
#     NameError: name 'u' is not defined — es el fallo del sábado
# exit()

make reparar                                # ← lámina 5 · s2-repaso-pandas · ⏱ ~40 s

# sonda · despues
make senales
#   → 13.8 / +0.8 / 10 de 192 · vuelve EXACTO

# 💼 NEGOCIO: una promoción en bebidas disparó la venta real y el pronóstico
#    no la vio venir. Sesgo −33.7% quiere decir que se compró de MENOS: es
#    venta perdida, no sobre-stock. Y está mal en las 24 tiendas a la vez, así
#    que la causa no es una tienda: es la categoría. Esa distinción es la que
#    decide si se reentrena un modelo o veinticuatro.

# deja el mundo: SANO


# ═════════════════════════════════════════════════════════════════════════════
#  RETO 2 · La herramienta de percepción
# ═════════════════════════════════════════════════════════════════════════════

# ── S2·R2 · contra qué se calibra ────────────────────────────────────────────
# id: 32 s1-r2-antes
# estado de partida: SANO · deja el mundo: SANO

make senales                                # ← lámina 32 · s1-r2-antes
#   → MAPE 13.8 · sesgo +0.7 · cobertura ~0.88 · 10 de 192 · ~5,700
#   → los cinco números se anotan y se dejan a la vista todo el reto

# 💼 NEGOCIO: **diez modelos malos en un mundo sano.** No es una avería: unos
#    son peores que otros y siempre lo fueron. Un umbral que pretenda dejar
#    esto en cero va a sonar todos los días, y una alarma que suena todos los
#    días se apaga a la semana. Ese es el costo de calibrar mal: no es un
#    falso positivo, es perder la alarma entera.


# ── S2·R2 · la ventana de trabajo, y comprobarla ─────────────────────────────
# id: 36 s1-r2-taller · 37 s1-r2-verificar · 38 s1-r2-verificar-salida
# ⏱ ~60 s el verificador
# estado de partida: SANO

# sonda · antes
make senales
#   → 13.8 / +0.8 / 10 de 192

make reparar                                # ← lámina 36 · s1-r2-taller · ⏱ ~40 s
make verificar ARGS="--reto 2"              # ← lámina 36 · s1-r2-taller · ⏱ ~60 s
docker compose run --rm agente python -m retos.verificar --reto 2  # ← láminas 37 y 38 · s1-r2-verificar · s1-r2-verificar-salida
#   → 8 comprobaciones, y la última línea: "Regenerando los datos limpios"
#   ⚠️ el verificador ROMPE el mundo para comprobar cada escenario y lo repara
#     al final. Si alguien lo corta a medias, queda en feed_caido.

# sonda · despues
make senales
#   → 13.8 / +0.8 / 10 de 192 · si sale 184, el verificador se cortó: make reparar

# 💼 NEGOCIO: la herramienta que acaba de pasar las ocho comprobaciones es la
#    que va a decidir, las próximas tres horas, qué merece la atención de un
#    analista. Si alarmara sobre la flota sana, el agente de la tarde
#    perseguiría fantasmas **y tendría razón en hacerlo**: el error no sería
#    suyo, sería de quien puso el umbral.

# deja el mundo: SANO


# ═════════════════════════════════════════════════════════════════════════════
#  RETO 3 · El primer agente, sin arquitectura
# ═════════════════════════════════════════════════════════════════════════════

# ── S2·R3 · ¿responde la llave? ──────────────────────────────────────────────
# id: 44 s1-r3-llave · 🔑
# estado de partida: SANO

make verificar ARGS="--reto 3"              # ← lámina 44 · s1-r3-llave
#   → ✓ la llave responde · si sale ✗, PROVEEDOR_LLM=mock y seguir

# 💼 NEGOCIO: nada todavía. Es la comprobación de que hay presupuesto de
#    tokens para las próximas dos horas.


# ── S2·R3 · romper el silencioso · el antes y el después ─────────────────────
# id: 48 s1-r3-antes-despues
# estado de partida: SANO · deja el mundo: sesgo_silencioso
# ⚠️ ES EL COMANDO MÁS IMPORTANTE DE LAS DOS SESIONES

# sonda · antes
make senales                                # ← lámina 48 · s1-r3-antes-despues
#   → MAPE 13.8 · sesgo +0.7 · 10 de 192 · ~5,700 unidades de mas

make romper ESCENARIO=sesgo_silencioso      # ← lámina 48 · s1-r3-antes-despues · ⏱ ~40 s

# sonda · despues
make senales                                # ← lámina 48 · s1-r3-antes-despues
#   → MAPE 14.5 (+0.7) · sesgo +4.7 (x6.5) · 16 de 192 · ~37,000 (x6.5)

# 💼 NEGOCIO: **treinta mil unidades de más en almacén**, contra un ruido
#    normal de seis mil. Es la avería más cara del taller y la más difícil de
#    ver: el MAPE se movió siete décimas, así que **ningún tablero con umbral
#    sobre el error habría sonado**. La señal que sí lo ve es el sesgo, porque
#    tiene dirección — y hacia arriba quiere decir que se compró de más, en
#    las ocho categorías a la vez. Si esto dura un trimestre, es capital
#    inmovilizado y merma.


# ── S2·R3 · el bucle plano, tres veces ───────────────────────────────────────
# id: 47 s1-r3-lectura · 50 s1-r3-ejecutar · 52 s1-r3-tres-veces
# 🔑 tres ejecuciones · ⏱ ~1 min cada una
# estado de partida: sesgo_silencioso

# sonda · antes
make senales
#   → 14.5 / +4.8 / 16 de 192

make plano ARGS="--verboso"                 # ← lámina 47 · s1-r3-lectura · 🔑
docker compose run --rm agente python -m agente plano --verboso  # ← lámina 50 · s1-r3-ejecutar
make plano ARGS="--verboso"                 # ← lámina 52 · s1-r3-tres-veces · 🔑 (2.ª)
make plano ARGS="--verboso"                 # ← lámina 52 · s1-r3-tres-veces · 🔑 (3.ª)
#   → tres salidas DISTINTAS sobre el mismo mundo, con temperatura 0

# sonda · despues
make senales
#   → 14.5 / +4.8 / 16 de 192 · IDÉNTICO: el bucle plano solo mira, no toca

# 💼 NEGOCIO: aquí está el hallazgo del reto, y no es técnico. **Tres
#    respuestas distintas al mismo problema no se pueden llevar a un comité de
#    inventario.** Da igual lo convincente que suene cada una: si el lunes
#    dice «reentrenen bebidas» y el martes dice otra cosa sobre los mismos
#    datos, nadie va a firmar una orden de compra con eso. La inconsistencia
#    no es un detalle de calidad: es lo que hace el sistema inutilizable.

# deja el mundo: sesgo_silencioso


# ═════════════════════════════════════════════════════════════════════════════
#  RECESO 20 min · y la segunda asistencia al volver
# ═════════════════════════════════════════════════════════════════════════════
#
# ⚠️ La asistencia de después del receso es la última del programa. Uno por
#    uno, en voz alta, con micrófono. Pasada esta, el acta ya no cambia.


# ═════════════════════════════════════════════════════════════════════════════
#  RETO 4 · La arquitectura cognitiva
# ═════════════════════════════════════════════════════════════════════════════

# ── S2·R4 · el grafo, contra el mundo sano ───────────────────────────────────
# id: 85 s2-r4-lectura · 106 s2-r4-salida · 🔑 · ⏱ ~1 min
# estado de partida: sesgo_silencioso · deja el mundo: SANO

# sonda · antes
make senales
#   → 14.5 / +4.8 / 16 de 192

make reparar                                # ← lámina 85 · s2-r4-lectura · ⏱ ~40 s
make agente ARGS="--verboso"                # ← lámina 85 · s2-r4-lectura · 🔑
docker compose run --rm agente python -m agente run --verboso  # ← lámina 106 · s2-r4-salida
#   → sin_hallazgos, severidad baja. Una guardia tranquila.

# sonda · despues
make senales
#   → 13.8 / +0.8 / 10 de 192

# 💼 NEGOCIO: **que no diga nada es el resultado correcto**, y hay que
#    decirlo en voz alta. Un vigilante que encuentra algo todas las mañanas
#    cuesta más que no tenerlo: consume el tiempo del analista que debería
#    estar mirando la vez que sí pasa algo.


# ── S2·R4 · la memoria ───────────────────────────────────────────────────────
# id: 99 s2-r4-memoria-comando
# estado de partida: SANO

docker compose run --rm agente python -m agente memoria  # ← lámina 99 · s2-r4-memoria-comando
#   → los diagnósticos de las ejecuciones anteriores, con su alcance
#   → si sale vacía, es que solo se corrió con mock: no hubo diagnóstico

# 💼 NEGOCIO: sin memoria, **el lunes se vuelve a diagnosticar lo del viernes
#    como si fuera nuevo.** Es la diferencia entre una guardia que acumula
#    contexto y una alarma que repite el mismo mensaje hasta que alguien la
#    silencia. Lo segundo es como se pierden los sistemas de monitoreo.


# ── S2·R4 · LA TRAMPA · una tienda que dejó de reportar ──────────────────────
# id: 104 s2-r4-antes-despues · 105 s2-r4-ejecutar · 107 s2-r4-salida-2 · 🔑
# estado de partida: SANO · deja el mundo: SANO
# ⚠️ ES EL CRITERIO DE ACEPTACIÓN DEL RETO

# sonda · antes
make senales                                # ← lámina 104 · s2-r4-antes-despues
#   → Flota · 192 modelos · MAPE 13.8 · sesgo +0.7 · 10 de 192 · ~5,700

make romper ESCENARIO=feed_caido            # ← lámina 104 · s2-r4-antes-despues · ⏱ ~40 s

# sonda · despues
make senales                                # ← lámina 104 · s2-r4-antes-despues
#   → Flota · 184 modelos  ← LO ÚNICO QUE CAMBIA
#   → MAPE 13.8 · sesgo +0.8 · IDÉNTICOS al mundo sano
#   → 9 de 184 · ~5,800 unidades de mas
#   ⚠️ dejar la pantalla veinte segundos y preguntar qué cambió. La sala mira
#     MAPE y sesgo, no ve nada, y ahí es cuando el denominador salta.

make agente ARGS="--verboso"                # ← lámina 105 · s2-r4-ejecutar · 🔑
docker compose run --rm agente python -m agente run --verboso  # ← lámina 107 · s2-r4-salida-2
#   → anomalia · tienda:arequipa · y NO recomienda reentrenar
#   → si dice `deriva`, esa es la conversación: no distinguió una tienda muda
#     de una degradación. Sirve igual, y sirve más.

make reparar                                # ← lámina 105 · s2-r4-ejecutar · ⏱ ~40 s

# 💼 NEGOCIO: **faltan 168 filas de telemetría porque una tienda entera dejó
#    de reportar durante 21 días.** No hay un problema de demanda: hay un
#    problema de datos, y son averías con arreglos opuestos. Lo caro es que
#    los dos números en los que la cadena confía —error y sesgo— están ciegos
#    acá: dan exactamente lo mismo que un martes normal. La única señal es que
#    la flota pasó de 192 a 184, y ningún tablero de umbrales la tiene, porque
#    los tableros miran los modelos que reportan.

# deja el mundo: SANO


# ═════════════════════════════════════════════════════════════════════════════
#  RETO 5 · De la recomendación a la acción
# ═════════════════════════════════════════════════════════════════════════════

# ── S2·R5 · sobre deriva, reentrena ──────────────────────────────────────────
# id: 124 s2-r5-deriva · 123 s2-r5-comando · 🔑 · ⏱ ~2 min
# estado de partida: SANO · deja el mundo: sesgo_silencioso
# ⚠️ ES EL ÚNICO BLOQUE DEL TALLER QUE ESCRIBE MODELOS DE VERDAD

# sonda · antes
curl -s "http://localhost:8000/v1/reentrenamientos"
#   → []  · la bitácora está vacía

make reparar && make romper ESCENARIO=sesgo_silencioso   # ← lámina 124 · s2-r5-deriva · ⏱ ~80 s
make actuar ARGS="--verboso"                # ← lámina 124 · s2-r5-deriva · 🔑
docker compose run --rm -e EJECUTAR_ACCIONES=1 agente python -m agente run --verboso  # ← lámina 123 · s2-r5-comando
#   → diagnóstico `deriva` · la política DEJA PASAR · 24 modelos reentrenados

# sonda · despues
curl -s "http://localhost:8000/v1/reentrenamientos"
#   → un registro, con su motivo, su filtro y su duración
#   ⚠️ con PROVEEDOR_LLM=mock sale [] ANTES Y DESPUÉS. No falló: sin llave no
#     hay diagnóstico que ejecutar.

# 💼 NEGOCIO: el agente reentrenó **24 modelos —una categoría, una tienda cada
#    uno— y dejó 168 intactos.** Eso es lo que hace la decisión aceptable:
#    acotada, reversible, y con el motivo escrito por si en enero alguien
#    pregunta por qué cambió el pronóstico de bebidas en agosto. Un agente que
#    hubiera reentrenado la flota entera habría «arreglado» el problema y
#    tocado 168 modelos que no lo necesitaban.

# deja el mundo: sesgo_silencioso


# ── S2·R5 · sobre anomalía, se frena ─────────────────────────────────────────
# id: 125 s2-r5-anomalia · 122 s2-r5-lectura · 🔑 · ⏱ ~2 min
# estado de partida: sesgo_silencioso · deja el mundo: feed_caido
# ⚠️ ES EL CRITERIO DE ACEPTACIÓN DEL RETO Y DEL DÍA

# sonda · antes
curl -s "http://localhost:8000/v1/reentrenamientos"
#   → un registro, el del bloque anterior

make reparar && make romper ESCENARIO=feed_caido   # ← láminas 125 y 122 · s2-r5-anomalia · s2-r5-lectura · ⏱ ~80 s
make actuar ARGS="--verboso"                # ← lámina 125 · s2-r5-anomalia · 🔑
#   → diagnóstico `anomalia` · la política NO EJECUTA NADA, y dice por qué
#   → ese texto no lo escribió el LLM: es la regla explicándose

# sonda · despues
curl -s "http://localhost:8000/v1/reentrenamientos"
#   → EL MISMO registro. Ni uno nuevo. Esa es la lámina.

# 💼 NEGOCIO: **el agente quería actuar y algo se lo impidió, y esa es la
#    decisión cara.** Reentrenar sobre una tienda muda habría metido el hueco
#    de datos dentro de 8 modelos que estaban perfectamente sanos, y nadie lo
#    habría notado hasta el siguiente cierre de mes — cuando el pronóstico de
#    arequipa empezara a fallar sin causa aparente. Lo que lo detuvo no es el
#    modelo ni el prompt: son doce líneas de Python. **El freno importa más
#    que el botón.**

# deja el mundo: feed_caido


# ── S2·R5 · la interfaz, de punta a punta ────────────────────────────────────
# id: 135 s2-r5-panel · 🔑 la ejecución del panel
# estado de partida: cualquiera · deja el mundo: igual

docker compose up -d ui                     # ← lámina 135 · s2-r5-panel
#   → abrir http://localhost:8501
#   → 1 · pestaña «El agente» → botón «Correr el agente», en vivo
#   → 2 · más abajo: Reflexion · Recomendaciones · Accion
#   → 3 · pestaña «Memoria»
#   → 4 · pestaña «Bitacora de acciones» — con el registro del bloque de deriva

curl -s -o /dev/null -w '%{http_code}\n' http://localhost:8501
#   → 200

# 💼 NEGOCIO: es la respuesta a «¿cómo sé que no divaga?». **Un agente cuya
#    ejecución no se puede inspeccionar es un agente en el que hay que creer**,
#    y creer no escala a una decisión de compra. Acá se lee qué miró, qué
#    concluyó, qué se objetó a sí mismo y qué llegó a ejecutar.


# ═════════════════════════════════════════════════════════════════════════════
#  CIERRE Y APAGADO
# ═════════════════════════════════════════════════════════════════════════════

# ── dejar el mundo sano antes de cerrar ──────────────────────────────────────
# id: — cortesía con quien clone el repo el lunes

# sonda · antes
make senales
#   → 184 modelos, si se acaba de correr el bloque de anomalía

make reparar                                # ⏱ ~40 s

# sonda · despues
make senales
#   → 13.8 / +0.8 / 10 de 192 · los 192 otra vez

# 💼 NEGOCIO: nada. Es higiene: quien abra el laboratorio el lunes tiene que
#    encontrar el mundo como estaba.


# ── apagar ───────────────────────────────────────────────────────────────────
# ⚠️ `make abajo` a secas NO se lleva mlflow ni ollama: tienen perfil. Y el
#    contenedor que sobrevive es el que después falla con «network not found».

docker compose --profile mlflow --profile local down
#   → ⚠️ SIN -v. Esa borra los volúmenes y con ellos los 192 modelos.

docker compose ps
#   → vacío
