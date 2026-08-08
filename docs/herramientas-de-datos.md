# Qué hay debajo de cada comando

Chuleta para dictar. El taller se apoya en `make` y Docker, y eso **esconde
dos cosas a la vez**: qué librería está corriendo por debajo, y qué cambió de
verdad al ejecutarlo. `make entrenar` no dice «scikit-learn» ni dice «la
versión del registro subió de 1 a 2».

Esta hoja deshace las dos capas. Para cada comando: la cadena entera hasta la
línea de Python que se ejecuta, la librería que entra en juego, y **el antes y
el después medidos**. Las cifras salen de un ensayo completo del laboratorio,
no de memoria.

---

## Parte 1 · La cadena, comando por comando

Todos los `make` del taller son la misma forma: **`make X` → `docker compose
run --rm <servicio> python -m <paquete> <subcomando>`**. El `--rm` borra el
contenedor al terminar; lo que sobrevive es el volumen `datos`.

| `make X` | La línea real que se ejecuta | Entra en |
|---|---|---|
| `arriba` | `docker compose build` + `docker compose up -d plataforma ui` | — |
| `seed` | `docker compose run --rm plataforma python -m plataforma seed` | `plataforma/__main__.py` |
| `datos` | `… python -m plataforma datos` | `plataforma/datos.py` |
| `entrenar` | `… python -m plataforma entrenar` | `plataforma/entrenar.py` |
| `pronosticar` | `… python -m plataforma pronosticar` | `plataforma/pronosticar.py` |
| `metricas` | `… python -m plataforma metricas` | `plataforma/metricas.py` |
| `consola` | `docker compose run --rm plataforma python` | un REPL con `/datos` montado |
| `romper E=x` | `… python -m plataforma escenario --nombre x` **+ `make pronosticar` + `make metricas`** | `plataforma/escenario.py` |
| `reparar` | `… python -m plataforma datos` **+ `make pronosticar` + `make metricas`** | `plataforma/datos.py` |
| `agente` | `docker compose run --rm agente python -m agente run` | `agente/grafo.py` |
| `plano` | `… python -m agente plano` | `agente/plano.py` |
| `senales` | `… python -m agente senales` | `agente/herramientas.py` |
| `memoria` | `… python -m agente memoria` | `agente/memoria.py` |
| `actuar` | `docker compose run --rm **-e EJECUTAR_ACCIONES=1** agente python -m agente run` | `agente/accion.py` |
| `verificar` | `docker compose run --rm agente python -m retos.verificar` | `retos/verificar.py` |
| `ui` | `docker compose up -d ui` | `ui/app.py` |
| `mlflow` | `docker compose --profile mlflow up -d mlflow` | servidor de MLflow |

**Las tres cosas que hay que saber decir de esta tabla:**

1. **`romper` y `reparar` son tres comandos, no uno**, y son la misma receta
   con la primera línea cambiada. Ninguna de las dos incluye `entrenar`.
2. **`-e EJECUTAR_ACCIONES=1` va antes del nombre del servicio.** Todo lo que
   está a la izquierda del servicio es de Docker; a la derecha, del programa.
3. **`run --rm` no deja nada vivo; `up -d` sí.** Es la trampa que vuelve tres
   veces durante la clase.

El despacho de subcomandos está en `plataforma/__main__.py:33`
(`argparse.ArgumentParser` + `add_parser`). Si alguien pregunta «¿de dónde sale
`seed`?», es ahí.

---

## Parte 2 · Qué cambió — el antes y el después, medido

Esto es lo que hay que poder justificar en vivo. Todas las cifras se midieron
ejecutando el laboratorio; las que dependen del día del mundo van marcadas.

### `make seed` — el estado de partida

| | |
|---|---|
| **Antes** | `/datos` vacío |
| **Después** | 76,800 filas de venta · 192 artefactos · 17,472 días-modelo |
| **La flota** | MAPE **13.8%** · sesgo **+0.8%** · cobertura 0.887 · 8 sobre umbral |

**La frase:** «Estos cuatro números son el punto de comparación de las ocho
horas. Todo lo que viene es cómo se movieron.»

### `make entrenar` — el único comando que toca un modelo

| | |
|---|---|
| **Antes** | `registro.json` → `"version": 1` · `entrenado_hasta: 2026-05-08` |
| **Después** | `"version": 2` · **la fecha NO se movió** |

**La frase:** «Un reentrenamiento arregla el ajuste, no la ignorancia. Sigue
sin saber nada de julio.»
**Ojo al ensayar:** la versión no se reinicia. En tu segundo ensayo verás 3→4.

### `make romper ESCENARIO=campana_promocional`

| | Antes | Después |
|---|---|---|
| MAPE flota | 13.8% | **16.0%** |
| Sesgo flota | +0.8% | **−10.6%** |
| Bebidas | 12.9% | **30.8%** — más del doble de la flota |
| Tiendas de bebidas sobre 20% | — | **18 de 24** |

**Negocio:** se pronosticó de MENOS. Es **venta perdida**, no sobre-stock.
**Modelo:** ninguno de los 192 se tocó. Está mal en las 24 tiendas a la vez,
así que la causa es la categoría, no una tienda.

### `make romper ESCENARIO=sesgo_silencioso` — el corazón del taller

| | Antes | Después |
|---|---|---|
| MAPE flota | 13.8% | **14.5%** ← siete décimas |
| Sesgo flota | +0.8% | **+4.7%** |
| Sobre umbral | 8 de 192 | **16 de 192** |
| Unidades de más | 6,532 | **36,981** |

**Negocio:** 36,981 unidades de más en almacén en catorce días. Plata
inmovilizada que nadie pidió.
**Modelo:** el MAPE apenas se movió, así que **un umbral sobre el MAPE no
suena**. La señal que lo dice está a dos centímetros de la que todos miran.

### `make romper ESCENARIO=feed_caido` — el que NO hay que reentrenar

| | Antes | Después |
|---|---|---|
| Filas de `metricas.csv` | 17,473 | **17,305** ← faltan 168 |
| MAPE flota | 13.8% | 13.7% |
| Sesgo flota | +0.8% | +0.8% |
| **Modelos contados** | 192 | **184** ← el delator |

**Negocio:** una tienda entera dejó de reportar durante 21 días. No hay
problema de demanda: hay ausencia de datos.
**Modelo:** los ocho de arequipa están sanos. **En MAPE y sesgo la flota se ve
sana** — el único rastro es el denominador.
> 168 filas ÷ 21 días = 8 modelos. 192 − 8 = 184. La aritmética cierra, y
> decirla en voz alta convence más que la cifra sola.

### `make reparar` — la vuelta al control

| | |
|---|---|
| **Después** | 13.8% · +0.8% · 8 de 192 · 6,532 unidades — **exacto** |

**La frase:** «Vuelve exacto, y por eso sirve de sonda. Si te sale otro
número, el `reparar` no corrió.»

### `make plano` (reto 3) y `make agente` (reto 4)

No hay un antes/después numérico: lo que cambia es **la respuesta**.
- `plano` ejecutado tres veces con temperatura 0 y el mismo mundo → **tres
  respuestas distintas**. Ninguna está mal; están incompletas de formas
  distintas.
- `agente` sobre el mismo mundo → una respuesta que **sobrevivió a su propia
  crítica**, con alcance e impacto en unidades.

### `make actuar` (reto 5)

| | Antes | Después |
|---|---|---|
| `/v1/reentrenamientos` | `[]` | **una entrada con su motivo** |
| Artefactos con hora nueva | — | **24 de 192** (bebidas) |

Sobre `feed_caido` en cambio **no ejecuta nada**, y ese es el punto del reto.
> **Al ensayar sin llave esto no se ve.** Con `PROVEEDOR_LLM=mock` el agente
> devuelve `sin_hallazgos`, no recomienda nada, y la sonda da `[]` **antes y
> después**. No es que el comando falle. Comprobado.

---

## Parte 3 · Las librerías: archivo, import y uso

### pandas — la que más aparece, y la única que la sala teclea

| Archivo | Línea | Import |
|---|---|---|
| `plataforma/modelo.py` | 11 | `import pandas as pd` |
| `plataforma/entrenar.py` | 19 | `import pandas as pd` |
| `plataforma/pronosticar.py` | 20 | `import pandas as pd` |
| `plataforma/metricas.py` | 20 | `import pandas as pd` |
| `ui/app.py` | 18 | `import pandas as pd` |

**Cómo se usa, en las líneas que importan:**

```python
# modelo.py:30-33 — las features, y la línea peligrosa
df[f"lag_{d}"]   = df["unidades"].shift(d)
df[f"media_{v}"] = df["unidades"].shift(1).rolling(v).mean()
#                                  └─ shift(1) para no filtrar el propio día

# metricas.py:43-46 — el cruce pronóstico contra realidad
pred = pd.read_csv(RUTA_PREDICCIONES, parse_dates=["fecha_objetivo"])
real = pd.read_csv(RUTA_VENTAS,       parse_dates=["fecha"])
df   = pred.merge(real, ...)

# metricas.py:64 — el MAPE, y de ahí sale «valor absoluto»
df["ape"] = (df["error"].abs() / seguro) * 100
```

Verbos que salen en pantalla: `read_csv`, `merge`, `groupby`, `agg`,
`shift`, `rolling`, `sort_values`, `to_csv`, `DataFrame`, `Series`,
`Timedelta`.

**Preguntas que pueden apretar:**
- *«¿por qué `shift(1)`?»* → sin él la media móvil de 7 días incluye el día
  que se predice. **Fuga de datos**: el modelo entrena viendo la respuesta.
- *«¿por qué un solo archivo de features?»* → si entrenamiento y pronóstico
  las calcularan distinto, aparece **training/serving skew**: funciona en el
  cuaderno y falla servido, sin que nada avise.
- *«¿dónde está `metricas.csv`?»* → en el volumen `datos`, en `/datos`. **No
  en tu disco.** Por eso `make consola`.

### scikit-learn — un solo archivo, tres líneas

| Archivo | Línea | Import |
|---|---|---|
| `plataforma/entrenar.py` | 20 | `from sklearn.linear_model import Ridge` |

```python
# entrenar.py:118-119
modelo   = Ridge(alpha=alpha).fit(X_tr, y_tr)
mape_val = _mape(y_va, pd.Series(modelo.predict(X_va), index=y_va.index))

# pronosticar.py:93 — el mismo objeto, del otro lado
pred = estimador.predict(ventana[COLUMNAS])
```

- *«¿por qué Ridge?»* → uno más complejo no cambia nada de lo que hacemos y
  alarga el entrenamiento de los 192. **Vigilamos modelos, no los exprimimos.**
- *«¿qué hace `alpha=1.0`?»* → penaliza coeficientes grandes. Con doce
  features correlacionadas —tres rezagos y dos medias móviles miden casi lo
  mismo— una regresión sin penalización se vuelve inestable.
- *«¿por qué el corte de validación es por tiempo?»* → repartir al azar una
  serie temporal entrena con días **posteriores** a los que evalúa.

### joblib — dos líneas, una por lado

| Archivo | Línea | Uso |
|---|---|---|
| `plataforma/entrenar.py` | 122 | `joblib.dump(modelo, ruta)` |
| `plataforma/pronosticar.py` | 68 | `{mid: joblib.load(r["artefacto"]) for …}` |

Eso es **toda la persistencia**. 1 KB por artefacto, 856 KB la flota entera.
- *«¿qué hay dentro de un `.joblib`?»* → los coeficientes de la Ridge,
  serializados. Se abre con `joblib.load` y es un objeto de scikit-learn.
- *«¿por qué no pickle?»* → joblib es pickle optimizado para arrays de numpy.
  Para un modelo de sklearn es lo idiomático.

### MLflow — el reencuentro con el Módulo 2

| Archivo | Línea | Import |
|---|---|---|
| `plataforma/entrenar.py` | 28 | `import mlflow` — **dentro de un `try`** |

```python
# entrenar.py:100-101, 125-138
mlflow.set_tracking_uri(f"file://{RUTA_MLRUNS}")
mlflow.set_experiment(EXPERIMENTO)
with mlflow.start_run(run_name=m["modelo_id"]):
    mlflow.log_params({"algoritmo": "Ridge", "alpha": …, "entrenado_hasta": …})
    mlflow.log_metric("mape_validacion", mape_val)
```

- *«¿parámetro o métrica?»* → parámetro es lo que decidiste **antes** de
  entrenar; métrica es lo que salió. Los primeros se filtran, las segundas se
  comparan.
- *«¿por qué el `import` está en un `try`?»* → **un registro de modelos no
  debe poder tumbar un entrenamiento.** Si la librería no está, el
  entrenamiento sigue.
- *«¿por qué no está levantado?»* → tiene `profiles: ["mlflow"]`, y un
  servicio con perfil solo arranca si se lo pides por su nombre.
- *«¿dónde guarda?»* → no tiene base de datos: `file:///datos/mlruns`, una
  carpeta del **mismo volumen** donde están los modelos.

### scipy — una sola línea en todo el taller

| Archivo | Línea | Import |
|---|---|---|
| `agente/herramientas.py` | 29 | `from scipy import stats` |

```python
# herramientas.py:327
ks, p = stats.ks_2samp([f["mape"] for f in b], [f["mape"] for f in r])
```

- *«¿qué compara un KS?»* → **la forma de dos distribuciones**, no sus medias.
  Devuelve un estadístico y un p-valor.
- *«¿por qué no se lo pedimos al LLM?»* → caro, poco confiable e
  **irreproducible**: la misma pregunta dos veces da dos números.
- *«¿qué es el p-valor?»* → responde *«¿pasó algo?»*, no *«¿me importa?»*.

### LangChain — el decorador y los mensajes

| Archivo | Línea | Import |
|---|---|---|
| `agente/herramientas.py` | 28 | `from langchain_core.tools import tool` |
| `agente/grafo.py` | 36 | `from langchain_core.messages import AnyMessage, HumanMessage, SystemMessage` |
| `agente/llm.py` | 32-42 | `ChatGoogleGenerativeAI`, `ChatGroq`, `ChatOpenAI` — según `PROVEEDOR_LLM` |

```python
# herramientas.py:116 — así se declara una herramienta
@tool
def comparar_periodos(...):
    """La docstring que el modelo lee para decidir si la llama."""

# grafo.py:136 — así se le pasan al modelo
llm = obtener_llm().bind_tools(HERRAMIENTAS)
```

- *«¿qué hace `bind_tools`?»* → le pasa al modelo el **esquema** de cada
  herramienta —nombre, argumentos y docstring— para que pueda pedirlas. **La
  docstring es prompt.**

### LangGraph — el domingo entero

| Archivo | Línea | Import |
|---|---|---|
| `agente/grafo.py` | 37 | `from langgraph.graph import END, START, StateGraph` |
| `agente/grafo.py` | 38 | `from langgraph.graph.message import add_messages` |
| `agente/grafo.py` | 39 | `from langgraph.prebuilt import ToolNode` |

```python
# grafo.py:56 — el estado, con el reductor
mensajes: Annotated[list[AnyMessage], add_messages]

# grafo.py:382-390 — el cableado
g = StateGraph(Estado)
g.add_node("percepcion",   percepcion)
g.add_node("herramientas", ToolNode(HERRAMIENTAS, messages_key="mensajes"))
g.add_node("diagnostico",  diagnostico)
g.add_node("reflexion",    reflexion)
g.add_node("revision",     revision)
g.add_node("recomendacion", recomendacion)
```

- *«¿por qué `add_messages` y no una lista?»* → es un **reductor**. Sin él,
  cada nodo que devuelve `mensajes` **reemplaza** la conversación en vez de
  añadirse.
- *«¿y ese `messages_key="mensajes"`?»* → `ToolNode` lee y escribe en
  `messages` por omisión. Nuestro estado usa `mensajes`. **Es la trampa que
  cuesta una hora, y el arreglo es una línea.**
- *«¿por qué un grafo y no un `while`?»* → un prompt con quince reglas cumple
  unas y olvida otras, y **cuáles olvida cambia en cada ejecución**. Un grafo
  no olvida un nodo.

### Streamlit — 286 líneas, y no se escriben

| Archivo | Línea | Import |
|---|---|---|
| `ui/app.py` | 19 | `import streamlit as st` |

Se usa lo básico y nada más: `st.title`, `st.caption`, `st.columns(4)`,
`st.metric`, `st.line_chart`, `st.dataframe`, `st.markdown`, `st.subheader`,
`st.success` / `st.warning`.

- *«¿decide algo la interfaz?»* → **no, y es deliberado.** Solo lee el estado
  que el grafo dejó y lo dibuja. Una interfaz que razona puede contradecir al
  agente, y entonces hay dos versiones de la verdad.

### FastAPI y httpx — la frontera

| Archivo | Uso |
|---|---|
| `plataforma/api.py` | `FastAPI`, `HTTPException`, `Query`, `BaseModel` de pydantic |
| `agente/*.py`, `ui/app.py` | `httpx` — **todo lo que el agente ve, lo ve por HTTP** |

Es la única flecha que cruza de `plataforma/` a `agente/`. El agente **no lee
el disco de la plataforma** y no sabe dónde está `metricas.csv`.

---

## La regla para responder en caliente

> **Modelos → scikit-learn + joblib. Tablas → pandas. Razonamiento →
> LangChain/LangGraph.** MLflow solo observa. scipy sale una vez.

Y si la pregunta es «¿qué hizo este comando?», la respuesta siempre tiene la
misma forma: **qué le costó al negocio** y **qué le pasó —o no— al modelo**.
La segunda es «nada» más veces de las que parece, y ese suele ser el punto.
