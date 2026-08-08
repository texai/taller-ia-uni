# Dónde aparece cada librería de datos

Chuleta para dictar. El taller se apoya en `make` y Docker, y eso **esconde
qué librería está corriendo por debajo**: `make entrenar` no dice
«scikit-learn» en ninguna parte. Esta hoja deshace ese enmascaramiento —
para cada herramienta, dónde vive en el código, en qué láminas sale a la
superficie, y qué es lo que la sala suele preguntar.

El orden es el del dictado.

---

## El resumen, en una tabla

| Librería | Dónde vive | Qué hace en el caso | Se ve en |
|---|---|---|---|
| **pandas** | `plataforma/modelo.py`, `entrenar.py`, `pronosticar.py`, `metricas.py`, `ui/app.py` | Features, el job batch y el cálculo de la telemetría. **Es la que más aparece** | S1 · 13 láminas |
| **scikit-learn** | `plataforma/entrenar.py` (`Ridge`, `linear_model`) | Los 192 modelos. Un `.fit()` por modelo | S1 · 6 láminas |
| **joblib** | `entrenar.py` (`dump`), `pronosticar.py` (`load`) | Persistencia del artefacto: **una línea por lado** | S1 · 5 láminas |
| **MLflow** | `plataforma/entrenar.py`, servicio con `profiles` | Registro de experimentos. Reencuentro con el Módulo 2 | S1 · 10 láminas |
| **scipy** | `agente/herramientas.py` (`stats.ks_2samp`) | El test que compara dos distribuciones de MAPE | S1 · 3 láminas |
| **statistics** | `agente/herramientas.py` | Medias y desviaciones, biblioteca estándar | S1 · reto 2 |
| **FastAPI / pydantic** | `plataforma/api.py` | La API de telemetría, `:8000` | S1 · 2 láminas |
| **LangChain** | `agente/plano.py`, `herramientas.py` (`@tool`) | `bind_tools`, los mensajes, el decorador de herramienta | S1 reto 3 · S2 reto 4 |
| **LangGraph** | `agente/grafo.py` | `StateGraph`, `ToolNode`, `add_messages` | S2 · 8 láminas |
| **Streamlit** | `ui/app.py` | La interfaz, 286 líneas | S1 demo · S2 cierre |
| **httpx** | `agente/*`, `ui/app.py` | Todo lo que el agente ve, lo ve por HTTP | transversal |

---

## Sesión 1 · dónde se levanta la máscara

### pandas — la que más sale, y la única que la sala teclea

| Lámina | Qué se ve |
|---|---|
| `s1-que-es-un-modelo` | La tabla que nombra las cuatro librerías. **Es la respuesta a «¿con qué se generan los modelos?»** |
| `s1-features` | `shift(1)` y las medias móviles. La línea más peligrosa del lab |
| `s1-validacion` | El corte por tiempo, con pandas |
| `s1-job-carga` | El job batch: `read_csv`, los 192 `load`, un CSV de salida |
| `s1-r1-groupby` | **Diez líneas que la sala pega en `make consola`.** `.agg()`, `groupby` |
| `s1-r1-a-mano` | La demo: el bloque anterior corriendo |

**Lo que pueden preguntar, y la respuesta corta:**

- *«¿por qué `shift(1)`?»* → sin él la media móvil de 7 días incluye el día que
  se predice. Es **fuga de datos**: el modelo entrena viendo la respuesta.
- *«¿por qué `.agg()` y no `.apply()`?»* → `apply` sobre un groupby emite un
  `FutureWarning` en pandas 2.2 y arrastra las columnas de agrupación. `agg`
  además separa visualmente lo que se promedia de lo que se suma.
- *«¿dónde está `metricas.csv`?»* → en el volumen `datos` de Docker, en
  `/datos`. **No en el disco.** Por eso `make consola`.

### scikit-learn — sale una vez y hay que nombrarla

| Lámina | Qué se ve |
|---|---|
| `s1-que-es-un-modelo` | El nombre, en la tabla |
| `s1-validacion` | `from sklearn.linear_model import Ridge`, y `.fit()` |
| `s1-mlflow-registro` | `algoritmo: Ridge` como parámetro registrado |

**Lo que pueden preguntar:**

- *«¿por qué Ridge y no algo mejor?»* → un modelo más complejo no cambia nada
  de lo que hacemos y alarga el entrenamiento de los 192. **El taller trata de
  vigilar modelos, no de exprimirlos.**
- *«¿qué hace `alpha=1.0`?»* → penaliza los coeficientes grandes. Con doce
  features correlacionadas entre sí —tres rezagos y dos medias móviles miden
  casi lo mismo— una regresión sin penalización reparte pesos enormes que se
  cancelan y se vuelve inestable.
- *«¿por qué el corte de validación es por tiempo?»* → repartir al azar una
  serie temporal entrena con días posteriores a los que evalúa.

### joblib — la que sorprende por lo pequeña

| Lámina | Qué se ve |
|---|---|
| `s1-artefactos` | `ls` de los 192 `.joblib`. 1 KB cada uno, 856 KB la flota |
| `s1-guardar` | `joblib.dump(modelo, ruta)`. **Esa es toda la persistencia** |
| `s1-job-carga` | `joblib.load`, el reverso exacto |

- *«¿qué hay dentro de un `.joblib`?»* → los coeficientes de la Ridge,
  serializados. Se abre con `joblib.load` y es un objeto de scikit-learn.
- *«¿por qué no pickle?»* → joblib es pickle optimizado para arrays de numpy.
  Para un modelo de sklearn es lo idiomático.

### MLflow — el reencuentro con el Módulo 2

| Lámina | Qué se ve |
|---|---|
| `s1-recap` | La caja en el diagrama de apertura. **Se promete acá** |
| `s1-mlflow-registro` | `log_params`, `log_metric`, `start_run` |
| `s1-mlflow-compose` | `profiles: ["mlflow"]` y `--backend-store-uri file://` |
| `s1-mlflow-ui` | La demo, 4 min |
| `s1-mlflow-captura` | El respaldo, con `mape_validacion` de 6.4 a 17.9 |

- *«¿parámetro o métrica?»* → parámetro es lo que decidiste **antes** de
  entrenar (algoritmo, `alpha`, hasta qué fecha); métrica es lo que salió. Los
  primeros se filtran, las segundas se comparan.
- *«¿por qué no está levantado?»* → tiene `profiles`, y un servicio con perfil
  solo arranca si se lo pide por su nombre. Igual que `ollama`.
- *«¿no debería ser el registro de producción?»* → sí, y en una cadena real lo
  sería. Acá manda `registro.json` **porque el job tiene que poder ejecutar sin
  MLflow arriba**. Simplificación consciente.
- *«¿dónde guarda?»* → no tiene base de datos: lee `file:///datos/mlruns`, una
  carpeta del mismo volumen donde están los modelos.

### scipy — solo un test, pero es el corazón del reto 2

| Lámina | Qué se ve |
|---|---|
| `s1-r2-tres-reglas` | La tercera regla: el test lo hace Python, no el LLM |
| `s1-glosario-estadistica` | Kolmogorov-Smirnov y p-valor, definidos |
| `s1-r2-significancia` | Trampa 3 · significativo no es relevante |

La llamada real es una línea, en `agente/herramientas.py`:

```python
ks, p = stats.ks_2samp([f["mape"] for f in b], [f["mape"] for f in r])
```

- *«¿qué compara un KS?»* → **la forma de dos distribuciones**, no sus medias.
  Devuelve un estadístico y un p-valor.
- *«¿por qué no se lo pedimos al LLM?»* → caro, poco confiable e
  **irreproducible**: la misma pregunta dos veces da dos números.
- *«¿qué es el p-valor?»* → responde *«¿pasó algo?»*, no *«¿me importa?»*. Con
  miles de días-modelo casi todo da significativo, y un agente que solo
  pregunta lo primero grita todos los días.

---

## Sesión 2 · LangChain, LangGraph y Streamlit

Ninguna de las tres se escribe en el taller, **y las tres se abren**. Decirlo
en voz alta ahorra ansiedad: nadie tiene que aprender LangGraph el domingo.

| Lámina | Librería | Qué se ve |
|---|---|---|
| `s1-r3-bucle` | LangChain | `bind_tools`, `HumanMessage`, `ToolMessage`. **ReAct entero** |
| `s1-r2-firma` | LangChain | El decorador `@tool` y la docstring como prompt |
| `s2-r4-estado` | LangGraph | El `TypedDict` del estado |
| `s2-r4-estado-por-que` | LangGraph | **`add_messages`**, y por qué no una lista |
| `s2-r4-messages-key` | LangGraph | La trampa: `ToolNode` lee otra clave |
| `s2-r4-aristas` | LangGraph | `StateGraph`, `START`, `END`, el cableado |
| `s2-r5-ui-reflexion` | Streamlit | Cómo se dibuja el razonamiento |

- *«¿qué hace `bind_tools`?»* → le pasa al modelo el **esquema** de cada
  herramienta —nombre, argumentos y docstring— para que pueda pedirlas. La
  docstring es lo único que el modelo lee para decidir si la llama: **es
  prompt**.
- *«¿por qué `add_messages` y no una lista?»* → es un reductor. Sin él, cada
  nodo que devuelve `messages` **reemplaza** la conversación en vez de
  añadirse.
- *«¿por qué LangGraph y no un `while`?»* → un prompt con quince reglas cumple
  unas y olvida otras, y cuáles olvida cambia en cada ejecución. **Un grafo no
  olvida un nodo.** Es la única de las tres librerías que aporta una idea y no
  solo una comodidad.

---

## Lo que `make` está escondiendo, comando por comando

| Comando | Lo que corre por debajo | Librerías |
|---|---|---|
| `make seed` | `datos` + `entrenar` + `pronosticar` + `metricas` | pandas, sklearn, joblib, MLflow |
| `make datos` | Genera `ventas.csv`, 76,800 filas | `csv` (estándar) |
| `make entrenar` | 192 × `Ridge().fit()` + `joblib.dump` + `mlflow.log_*` | **sklearn, joblib, MLflow, pandas** |
| `make pronosticar` | 192 × `joblib.load` + `.predict()` → CSV | **joblib, pandas** |
| `make metricas` | Cruza pronóstico contra realidad | **pandas** |
| `make consola` | `python` dentro del contenedor | **pandas** (la sala la usa) |
| `make senales` | Llama la API y agrega | httpx |
| `make agente` / `plano` | El grafo o el bucle | **LangGraph / LangChain**, scipy |
| `make ui` | Streamlit en `:8501` | **Streamlit, pandas** |
| `make mlflow` | El servidor de MLflow con `--profile` | **MLflow** |

**La regla para responder en vivo:** todo lo que toca *modelos* es
scikit-learn + joblib; todo lo que toca *tablas* es pandas; todo lo que toca
*razonamiento* es LangChain/LangGraph. MLflow solo observa, y scipy aparece
una sola vez.
