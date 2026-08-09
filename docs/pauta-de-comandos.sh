#!/usr/bin/env zsh
# =============================================================================
#  PAUTA DE COMANDOS · Taller 02 de caso aplicado de IA en industria
#  Ernesto Anaya · UNI · sábado 8 y domingo 9 de agosto de 2026
# =============================================================================
#
#  ESTO NO SE EJECUTA ENTERO.
#
#  Es una pauta, no un script: se lee de arriba abajo y se copia un bloque a la
#  vez. Ejecutarlo de una sentada levantaría y rompería el mundo cinco veces
#  seguidas y no probaría nada — la mitad del valor está en mirar la salida
#  entre comando y comando.
#
#  Sirve para dos cosas:
#    · ENSAYAR, antes del sábado, que los 36 comandos del curso funcionan.
#    · DICTAR, con la escaleta al lado, sabiendo qué viene y qué tiene que salir.
#
#  ---------------------------------------------------------------------------
#  CÓMO SE LEE
#
#  Cada bloque tiene tres clases de línea y se distinguen a la vista:
#
#      # sonda · antes        el estado ANTES, para poder comparar
#      <comando>  # ← lámina S1·40 · id      lo que el curso dicta, y DÓNDE sale
#      # sonda · despues      LA MISMA LÍNEA, para ver qué cambió
#
#  La marca se lee al revés que la escaleta: mirando la línea que toca teclear,
#  saber qué está proyectado. **El número es lo que se busca** — se teclea en
#  el salto rápido del mando y la clase entera va ahí; `S1·40` es la lámina 40
#  de la sesión 1. El identificador va detrás porque no cambia nunca y el
#  número sí: una lámina nueva en medio corre todas las de después.
#
#  Para regenerarlos:  npm run numerar-pauta
#
#  Las sondas NO llevan marca —no se dictan, son del ensayo—, y la cabecera
#  `# id:` de cada bloque lista las láminas que cubre.
#
#  La sonda de después es la misma de antes, literal. Si una lista archivos y
#  la otra cuenta filas, hay dos hechos y ninguna comparación.
#
#  Y la evidencia casi nunca es que aparezcan archivos. La mayoría de estos
#  comandos no crean nada: reescriben un CSV que ya estaba y mueven un número
#  dentro. `ls` no distingue un `metricas.csv` sano de uno degradado — mismo
#  nombre, mismas 17,472 filas, 301 bytes de diferencia sobre 1.7 MB. Por eso
#  la sonda del taller es `make senales`, que imprime lo que sí cambia.
#
#  Marcas:      ⏱  tarda       🔑 gasta llave de LLM
#
#  OJO CON EL 🔑 AL ENSAYAR. Con `PROVEEDOR_LLM=mock` esos bloques corren y
#  terminan en verde, pero el agente devuelve `sin_hallazgos` y no recomienda
#  nada -- asi que `make actuar` no registra ningun reentrenamiento y la sonda
#  de `/v1/reentrenamientos` da `[]` ANTES Y DESPUES. No es que el comando
#  falle: es que sin llave no hay diagnostico que ejecutar. Los bloques con 🔑
#  solo se ensayan de verdad con una llave puesta. Comprobado.
#
#  `npm run validar-pauta` comprueba que ninguna lámina con comando se quede
#  sin su marca `←`; con `-- --listar` imprime el mapa entero.
#
#  ---------------------------------------------------------------------------
#  DESDE DÓNDE SE CORRE
#
#      cd ~/ruta/a/taller-ia-uni-lab
#
#  En Windows no hay `make`: los atajos son `.\taller.ps1 <tarea>`, con el
#  mismo nombre detrás. Van anotados al lado donde cambian.
#
#  ---------------------------------------------------------------------------
#  ESTADO DEL MUNDO
#
#  Es el riesgo real de un ensayo largo. Dos `make romper` sin `make reparar`
#  en medio se apilan y las lecturas dejan de significar nada, y
#  `make verificar` DEJA EL MUNDO EN feed_caido. Cada bloque dice de qué estado
#  parte y en cuál lo deja. Respetar ese orden es la mitad de que el ensayo
#  valga.
# =============================================================================

if [[ "${ZSH_EVAL_CONTEXT:-}" == *:file:* || "${BASH_SOURCE[0]:-}" == "$0" ]]; then
  cat >&2 <<'FIN'

  Esta pauta no se ejecuta entera.

  Levantaría y rompería el mundo cinco veces seguidas sin que nadie mire nada,
  que es exactamente lo contrario de para lo que existe. Ábrela y copia un
  bloque a la vez, mirando la salida entre uno y otro.

FIN
  exit 1
fi


# ═════════════════════════════════════════════════════════════════════════════
#  ANTES DE LA CLASE · no se teclea delante de la sala
# ═════════════════════════════════════════════════════════════════════════════

# ── preparación · construir e instalar ───────────────────────────────────────
# id: s1-levantar · acá con el atajo; en clase se dicta desenvuelto
# estado de partida: nada, o un `make reset` recién hecho

# sonda · antes
docker compose ps
#   → vacío

make arriba                        # ← lámina S1·40 · s1-levantar · ⏱ ~5 min la primera vez

# sonda · despues
docker compose ps
#   → plataforma y ui, en pie. El agente NO aparece: no es un servicio

# deja el mundo: entorno levantado, sin datos


# ── preparación · el mundo, desde cero ───────────────────────────────────────
# id: s1-caso-estado · s1-seed · s1-datos-sin-make
# estado de partida: entorno levantado, `/datos` vacío

# sonda · antes
make archivos                      # ← lámina S1·15 · s1-caso-estado
#   → «/datos está vacío. Corre:  make seed»

make seed                          # ← lámina S1·41 · s1-seed · ⏱ ~30 s

# sonda · despues — y es la lámina, no solo una sonda
make archivos                      # ← lámina S1·15 · s1-caso-estado
#   → ventas.csv 76,800 filas · modelos/ 193 archivos (192 + registro.json)
#     predicciones.csv y metricas.csv 17,472 filas · ejecuciones_job.csv 1 fila
#     mlruns/ 2,881 archivos — MLflow escribe desde el primer entrenamiento,
#     mucho antes de que se hable de MLflow. No es un resto de otra corrida.

# ⚠️ ESTA es la respuesta a «hice make seed y `ls` no muestra nada»: /datos es
#    un volumen de Docker, no una carpeta del disco. Sale en cada clase.
make archivos ARGS="--ver metricas.csv"      # ← lámina S1·16 · s1-datos-sin-make
#   → cabecera + 5 filas de telemetría

# y los dos de la lámina siguiente, que son los mismos sin atajo. `ls` y `head`
# son los de toda la vida; lo unico que hay que aprender es el prefijo.
docker compose run --rm plataforma ls -lh /datos              # ← lámina S1·16 · s1-datos-sin-make
#   → las seis entradas, con tamaño y fecha
docker compose run --rm plataforma head -3 /datos/metricas.csv  # ← lámina S1·16 · s1-datos-sin-make
#   → cabecera + 2 filas
#   ⚠️ head y NO cat: metricas.csv son 17,472 líneas y se lleva la terminal

# deja el mundo: SANO


# ── preparación · los cinco retos, comprobados ───────────────────────────────
# id: — ensayo del docente; esta corrida entera NO sale en clase
# ⏱ ~2 min · 🔑 con --con-llm
# estado de partida: mundo SANO

# sonda · antes
make senales
#   → 13.8 / +0.8 / 8 de 192

make verificar
#   → "Las 24 comprobaciones pasaron."

# sonda · despues                     ⚠️ verificar DEJA EL MUNDO EN feed_caido
make reparar && make senales
#   → 13.8 / +0.8 / 8 de 192 · si sale distinto, el `reparar` no corrió

# deja el mundo: SANO


# ═════════════════════════════════════════════════════════════════════════════
#  SESIÓN 1 · sábado, 15:00
# ═════════════════════════════════════════════════════════════════════════════

# ── S1·U3 · levantar el entorno, desenvuelto ─────────────────────────────────
# id: s1-levantar · el `make arriba` sin el atajo
# estado de partida: mundo sano

# sonda · antes
docker compose ps

docker compose up -d plataforma ui                            # ← lámina S1·40 · s1-levantar

# sonda · despues
docker compose ps
#   → los mismos dos. Si ya estaban, no pasa nada: `up` es idempotente


# ── S1·U3 · poblar el mundo, desenvuelto ─────────────────────────────────────
# id: s1-seed · en clase NO se corre; se lee. Acá se ensaya que funciona
# ⏱ ~30 s

docker compose run --rm plataforma python -m plataforma seed  # ← lámina S1·41 · s1-seed
#   → 1/4 … 4/4 · "192 modelos con 17,472 dias-modelo de telemetria."


# ── S1·U3 · los 192 en disco ─────────────────────────────────────────────────
# id: s1-artefactos

docker compose run --rm plataforma ls -la /datos/modelos | head  # ← lámina S1·44 · s1-artefactos
#   → dem-abarrotes-arequipa.joblib … 1025 bytes cada uno
docker compose run --rm plataforma sh -c 'ls /datos/modelos | wc -l; du -sh /datos/modelos'
#   → 193 · 856K


# ── S1·U3 · el mundo por dentro ──────────────────────────────────────────────
# id: s1-mundo-crudo

docker compose run --rm plataforma head -1 /datos/ventas.csv  # ← lámina S1·50 · s1-mundo-crudo
#   → fecha,tienda,region,categoria,unidades,unidades_demandadas,en_promocion,quiebre_stock
docker compose run --rm plataforma sh -c "awk -F, '\$8+0==1' /datos/ventas.csv | head -3"
#   → tres días con quiebre: `unidades` por debajo de `unidades_demandadas`
#     Es la señal que el domingo a las 12:30 explica el agujero de la política


# ── S1·U3 · reentrenar, y solo eso ───────────────────────────────────────────
# id: s1-entrenar · el único comando del taller que reescribe un modelo
# ⏱ ~30 s

# sonda · antes
docker compose run --rm plataforma sh -c "grep -o '\"version\": [0-9]*' /datos/modelos/registro.json | head -1"
#   → "version": 1  en un mundo recién sembrado

docker compose run --rm plataforma python -m plataforma entrenar  # ← lámina S1·65 · s1-entrenar

# sonda · despues
docker compose run --rm plataforma sh -c "grep -o '\"version\": [0-9]*' /datos/modelos/registro.json | head -1"
#   → "version": 2   ← lo único que cambió. `entrenado_hasta` sigue en 2026-05-08
#
#   OJO en el segundo ensayo: la versión NO se reinicia. Sobrevive a `entrenar`
#   y a `reparar` —solo la borra `make reset`— así que el ensayo de mañana va a
#   dar 3 → 4, y el del sábado quizá 5 → 6. La evidencia es **que sube en uno**,
#   no la cifra. Medido: tras cuatro `entrenar` el registro decía 4.


# ── S1·U3 · MLflow ───────────────────────────────────────────────────────────
# id: s1-mlflow-ui

# sonda · antes
curl -s -o /dev/null -w '%{http_code}\n' http://localhost:5000
#   → 000 (no está levantado: tiene `profiles`, y `make arriba` no lo toca)

make mlflow                        # ← lámina S1·75 · s1-mlflow-ui · ⏱ ~20 s la primera vez

# sonda · despues
curl -s -o /dev/null -w '%{http_code}\n' http://localhost:5000
#   → 200 · abrir y añadir la columna mape_validacion en «Columns»


# ── S1·U3 · la interfaz ──────────────────────────────────────────────────────
# id: s1-demo-ui

# sonda · antes
docker compose ps

docker compose up -d ui                                       # ← lámina S1·59 · s1-demo-ui

# sonda · despues
docker compose ps
#   → ui en pie. Y de los `run --rm` que llevamos, ni rastro: esa es la lámina
curl -s -o /dev/null -w '%{http_code}\n' http://localhost:8501
#   → 200


# ── S1·U4 · el laboratorio, entero ───────────────────────────────────────────
# id: s1-lab-arbol · s1-lab-ayuda · s1-lab-lectura · se evidencian solos

ls                                                            # ← lámina S1·83 · s1-lab-arbol
#   → cuatro carpetas: plataforma/ agente/ ui/ retos/ · más Makefile y compose

make ayuda                                                    # ← lámina S1·87 · s1-lab-ayuda
#   → los 22 atajos, con su descripción. Sale del propio Makefile

make senales                                                    # ← lámina S1·88 · s1-lab-lectura
#   → la sonda, presentada acá por primera vez: 13.8 / +0.8 / 8 de 192


# ── S1·U5 · ¿estoy en condiciones de empezar? ────────────────────────────────
# id: s1-r1-listo · estado de partida: mundo SANO

make verificar ARGS="--reto 1"                                  # ← lámina S1·96 · s1-r1-listo
#   → ✓ 192 modelos en produccion · ✓ hay telemetria suficiente


# ── S1·U5 · la telemetría por la API ─────────────────────────────────────────
# id: s1-r1-api · s1-r1-lectura · s1-r1-swagger · se evidencian solos

curl -s "http://localhost:8000/v1/metricas?categoria=bebidas&desde=2026-07-01"  # ← lámina S1·100 · s1-r1-api
#   → 912 filas de JSON. Con `| head` para no llenar la terminal
curl -s "http://localhost:8000/v1/metricas?categoria=bebidas" | head  # ← lámina S1·105 · s1-r1-lectura
#   → una fila por modelo y día, con unidades además de porcentajes

# la lámina de Swagger no teclea nada: se abre en el navegador. Esto solo
# comprueba, en el ensayo, que la interfaz responde antes de proyectarla.
curl -s -o /dev/null -w '%{http_code}\n' http://localhost:8000/docs   # ← lámina S1·99 · s1-r1-swagger
#   → 200 · abrir http://localhost:8000/docs y probar GET /v1/metricas
#     con «Try it out». Debajo sale el curl equivalente, ya escrito


# ── S1·U5 · romper el mundo · campaña promocional ────────────────────────────
# id: s1-r1-romper · s1-r1-lectura
# estado de partida: mundo SANO

# sonda · antes
make senales
#   → 13.8 / +0.8 / 8 de 192 · 6,532 unidades de más

docker compose run --rm plataforma python -m plataforma escenario --nombre campana_promocional  # ← lámina S1·102 · s1-r1-romper
make romper ESCENARIO=campana_promocional   # ← lámina S1·105 · s1-r1-lectura · ⏱ ~40 s
#   (la primera línea es la etapa 1 de las tres de `romper`; el atajo las corre
#    las tres. En el ensayo vale correr solo el atajo)

# sonda · despues
make senales
#   → 16.0 / −10.6 · bebidas se despega sola. El sesgo se fue HACIA ABAJO

# deja el mundo: campana_promocional


# ── S1·U5 · el reto a mano · pandas dentro del contenedor ───────────────────
# id: s1-r1-a-mano
# estado de partida: campana_promocional
#
# Es el unico bloque de la pauta que abre un interprete en vez de correr un
# comando y volver. Conviene ensayarlo: se sale con exit(), y si se olvida, la
# terminal se queda dentro y el siguiente comando de la pauta no hace nada.

make consola                                                    # ← lámina S1·108 · s1-r1-a-mano
#   → Python 3.12 · pandas puesto · /datos montado

# Y dentro, el bloque de la lamina. Se pega entero y se pulsa Enter dos veces:
#
#   import pandas as pd
#   m = pd.read_csv("/datos/metricas.csv", parse_dates=["fecha"])
#   u = m[m["fecha"] >= m["fecha"].max() - pd.Timedelta(days=13)]
#   por = u.groupby("categoria").agg(
#       mape=("mape", "mean"),
#       pronosticado=("unidades_pronosticadas", "sum"),
#       real=("unidades_reales", "sum"),
#   )
#   por["sesgo_pct"] = (por.pronosticado - por.real) / por.real * 100
#   por[["mape", "sesgo_pct"]].round(1).sort_values("mape", ascending=False)
#
#   → bebidas 30.8 / −32.4, y las otras siete entre 12 y 15
#
# Y la segunda pregunta, la peor tienda dentro de bebidas:

#   b = u[u.categoria == "bebidas"]
#   b.groupby("tienda")["mape"].mean().round(1).sort_values().tail()
#   → chorrillos 55.3 · san-miguel 51.8 · jesus-maria 46.8 · magdalena 45.7
#   → 18 de las 24 tiendas de bebidas cruzan el 20%
#
#   OJO: esta linea se teclea DENTRO del interprete, no en la terminal. Si la
#   pauta se corriera de un tirón, el shell la leeria como un comando y no lo
#   es -- es la razon de que el guardia de arriba aborte la ejecucion completa.

# exit()
# deja el mundo: campana_promocional


# ── S2 · el repaso de pandas del domingo ─────────────────────────────────────
# id: s2-repaso-pandas · el mismo bloque de arriba, condensado en una lamina
# estado de partida: mundo SANO · deja el mundo: SANO
#
# No se dicta: se proyecta por si alguien quiere reproducir el reto 1, o para
# quien no vino el sabado. Los dos bloques de Python son los MISMOS de arriba
# y van con un solo boton de copiar cada uno -- que es lo que falto el sabado.

# sonda · antes
make senales
#   → 13.8 / +0.8 / 10 de 192 · 6,569 unidades de mas

make romper ESCENARIO=campana_promocional   # ← lámina S2·5 · s2-repaso-pandas · ⏱ ~40 s
make consola                                                # ← lámina S2·5 · s2-repaso-pandas
#   → se pegan los dos bloques de la lamina anterior de esta pauta
#   → bloque 1: bebidas 31.6 / −33.7, y las otras siete entre 11.9 y 15.4
#   → bloque 2: chorrillos 59.9 · magdalena 49.6 · jesus-maria 48.0
#   ⚠ el segundo bloque necesita el `u` del primero. Pegado solo, da
#     NameError: name 'u' is not defined -- es el fallo del sabado
# exit()
make reparar                                # ← lámina S2·5 · s2-repaso-pandas · ⏱ ~40 s
#   → obligatorio: el reto 2 empieza midiendo contra la flota sana

# sonda · despues
make senales
#   → 13.8 / +0.8 / 10 de 192 · vuelve EXACTO. Si no, el reparar no corrio


# ── S1·U5 · repararlo y romperlo otra vez · el silencioso ────────────────────
# id: s1-r1-silencioso · ES EL COMANDO MÁS IMPORTANTE DEL TALLER
# estado de partida: campana_promocional

# sonda · antes
make senales
#   → 16.0 / −10.6

make reparar && make romper ESCENARIO=sesgo_silencioso  # ← lámina S1·112 · s1-r1-silencioso · ⏱ ~80 s
# Windows:  .\taller.ps1 reparar; .\taller.ps1 romper sesgo_silencioso

# sonda · despues
make senales
#   → 14.5 / +4.7 / 16 de 192 · 36,981 unidades de más
#
#     ACÁ ESTÁ EL TALLER. El MAPE se movió siete décimas —ruido— y el sesgo se
#     multiplicó por seis. Un `ls` sobre metricas.csv da idéntico antes y
#     después: mismo nombre, 17,472 filas, 301 bytes de diferencia.

# deja el mundo: sesgo_silencioso


# ── S1·U6 · el reto 2, comprobado ────────────────────────────────────────────
# id: s1-r2-taller · s1-r2-verificar
# estado de partida: sesgo_silencioso

# sonda · antes
make senales
#   → 14.5 / +4.7

make reparar                       # ← lámina S2·36 · s1-r2-taller · ⏱ ~40 s

# sonda · despues
make senales
#   → 13.8 / +0.8 / 8 · vuelve EXACTO. Por eso sirve de sonda

make verificar ARGS="--reto 2"     # ← lámina S2·36 · s1-r2-taller · ⏱ ~60 s
docker compose run --rm agente python -m retos.verificar --reto 2  # ← lámina S2·37 · s1-r2-verificar
#   → las 8 comprobaciones, y al final "Regenerando los datos limpios"

# sonda · despues                     ⚠️ el verificador deja el mundo roto
make reparar && make senales
#   → 13.8 / +0.8

# deja el mundo: SANO


# ── S1·U7 · ¿responde mi llave? ──────────────────────────────────────────────
# id: s1-r3-llave · 🔑

make verificar ARGS="--reto 3"                                  # ← lámina S2·44 · s1-r3-llave
#   → ✓ 7 herramientas expuestas · ✓ <proveedor> responde y sabe llamar herramientas
#   → sin llave: "· proveedor mock: no se comprueba el razonamiento"


# ── S1·U7 · el bucle plano, tres veces ───────────────────────────────────────
# id: s1-r3-lectura · s1-r3-ejecutar · 🔑 tres ejecuciones · ⏱ ~1 min cada una
# estado de partida: mundo SANO

make romper ESCENARIO=sesgo_silencioso   # ← lámina S2·47 · s1-r3-lectura · ⏱ ~40 s

# sonda · antes
make memoria
#   → [] o lo que hubiera de antes

make plano ARGS="--verboso"   # ← lámina S2·47 · s1-r3-lectura
docker compose run --rm agente python -m agente plano --verboso  # ← lámina S2·50 · s1-r3-ejecutar
make plano ARGS="--verboso"   # ← lámina S2·47 · s1-r3-lectura
#   → tres diagnósticos. Comparar qué herramientas llamó cada uno, en qué
#     orden, y qué severidad puso. Con temperatura 0, y no coinciden

# sonda · despues
make memoria
#   → SIN CAMBIOS. El bucle plano NO tiene memoria: esa es media unidad

# deja el mundo: sesgo_silencioso


# ═════════════════════════════════════════════════════════════════════════════
#  SESIÓN 2 · domingo, 09:00
# ═════════════════════════════════════════════════════════════════════════════

# ── S2 · arranque ────────────────────────────────────────────────────────────
# estado de partida: lo que quedara del sábado, roto o apagado

# sonda · antes
docker compose ps
#   → probablemente vacío, si se apagó anoche

make arriba
make reparar                                       # ⏱ ~40 s

# sonda · despues
docker compose ps
make senales
#   → plataforma y ui en pie · 13.8 / +0.8 / 8
#     Los 192 modelos siguen siendo los de ayer: nadie los ha tocado

# deja el mundo: SANO


# ── S2·U4 · el grafo, contra el mundo sano ───────────────────────────────────
# id: s2-r4-lectura · s2-r4-salida · 🔑 · ⏱ ~1 min

# sonda · antes
make memoria
#   → lo que dejó ayer el reto 3

make agente ARGS="--verboso"                                    # ← lámina S2·85 · s2-r4-lectura
docker compose run --rm agente python -m agente run --verboso   # ← lámina S2·106 · s2-r4-salida
#   → percepción, diagnóstico, REFLEXIÓN con su veredicto, recomendaciones

# sonda · despues
make memoria
#   → una entrada más. El grafo SÍ escribe: esa es la diferencia con ayer
docker compose run --rm agente python -m agente memoria         # ← lámina S2·99 · s2-r4-memoria-comando
#   → lo mismo, sin el atajo


# ── S2·U4 · la trampa · la tienda muda ───────────────────────────────────────
# id: s2-r4-ejecutar · 🔑 · estado de partida: mundo SANO

# sonda · antes
docker compose run --rm plataforma sh -c 'wc -l < /datos/metricas.csv'
#   → 17473 (17,472 + cabecera)

make romper ESCENARIO=feed_caido   # ← lámina S2·105 · s2-r4-ejecutar · ⏱ ~40 s

# sonda · despues
docker compose run --rm plataforma sh -c 'wc -l < /datos/metricas.csv'
#   → 17305 · faltan 168 filas: 8 categorías × 21 días de arequipa
make senales
#   → 13.7 / +0.8 · en MAPE y sesgo LA FLOTA SE VE SANA. Ese es el punto
#   → pero mira el denominador: «7 de 184 modelos», no de 192. Los ocho que
#     faltan son arequipa entera, y es lo único de la sonda que lo delata.
#     Vale la pena señalarlo con el dedo: la degradación no siempre se ve en
#     la métrica, a veces se ve en cuántas filas quedaron para calcularla.

make agente ARGS="--verboso"                                    # ← lámina S2·85 · s2-r4-lectura
#   → tipo: anomalia · alcance: tienda:arequipa · y NO recomienda reentrenar

# deja el mundo: feed_caido


# ── S2·U5 · sobre deriva, reentrena ──────────────────────────────────────────
# id: s2-r5-lectura · s2-r5-comando · 🔑 · ⏱ ~2 min
# estado de partida: feed_caido

make reparar && make romper ESCENARIO=sesgo_silencioso     # ⏱ ~80 s

# sonda · antes
curl -s http://localhost:8000/v1/reentrenamientos
#   → [] o lo que hubiera
docker compose run --rm plataforma sh -c 'ls -l --time-style=+%H:%M /datos/modelos | head -3'
#   → la hora de los artefactos

make actuar ARGS="--verboso"                                    # ← lámina S2·122 · s2-r5-lectura
docker compose run --rm -e EJECUTAR_ACCIONES=1 agente python -m agente run --verboso  # ← lámina S2·123 · s2-r5-comando
#   → ✓ reentrenar → categoria:bebidas · 24 modelos

# sonda · despues
curl -s http://localhost:8000/v1/reentrenamientos
#   → una entrada nueva, con su motivo escrito por el agente
docker compose run --rm plataforma sh -c 'ls -l --time-style=+%H:%M /datos/modelos | head -3'
#   → 24 artefactos con hora nueva. Los otros 168, intactos

# deja el mundo: sesgo_silencioso, con bebidas reentrenada


# ── S2·U5 · sobre anomalía, se frena ─────────────────────────────────────────
# id: s2-r5-lectura · 🔑 · EL CRITERIO DE ACEPTACIÓN DEL RETO

make reparar && make romper ESCENARIO=feed_caido    # ⏱ ~80 s

# sonda · antes
curl -s http://localhost:8000/v1/reentrenamientos | tail -c 200
#   → la última entrada, la de bebidas

make actuar ARGS="--verboso"                                    # ← lámina S2·122 · s2-r5-lectura
#   → ✗ no se ejecutó: el diagnostico es una anomalia de datos: reentrenar
#     aqui contaminaria modelos sanos
#     ESE TEXTO NO LO ESCRIBIÓ EL LLM. Está en agente/accion.py, literal

# sonda · despues
curl -s http://localhost:8000/v1/reentrenamientos | tail -c 200
#   → LA MISMA. Ninguna entrada nueva: el agente quería actuar y no pudo

# deja el mundo: feed_caido


# ═════════════════════════════════════════════════════════════════════════════
#  DESPUÉS DE LA CLASE
# ═════════════════════════════════════════════════════════════════════════════

# ── cerrar sin perder nada ───────────────────────────────────────────────────

make reparar                                       # dejarlo sano para la próxima

# sonda · antes
docker compose ps

make abajo
#   → apaga. SIN la -v: los volúmenes se quedan

# sonda · despues
docker compose ps
#   → vacío
docker compose run --rm plataforma ls /datos
#   → los cinco archivos siguen ahí. Esa es la diferencia con `make reset`


# ── el botón de pánico · solo si hace falta ──────────────────────────────────
# ⚠️ borra los 192 modelos. Después hay que volver a hacer `make seed`

# sonda · antes
docker compose run --rm plataforma ls /datos

# make reset

# sonda · despues
# docker compose run --rm plataforma ls /datos
#   → vacío


# ── espacio en disco, si la construcción falla ───────────────────────────────

# sonda · antes
docker system df

docker builder prune -f

# sonda · despues
docker system df
#   → la caché de construcción, liberada. Dejar 12 GB libres antes de empezar
