# NaturIA

Aplicación web educativa de Ciencias Naturales con inteligencia artificial real, para la Feria de la Ciencia de la **Institución Educativa Luis Andrade Valderrama** (Giraldo, Antioquia).

Los visitantes escanean un código QR en el stand, la app se abre en su celular y pueden conversar con un tutor de IA especializado en cada estación, poner a prueba sus propios prompts, y entender por qué nunca hay que creerle a la IA a la primera.

---

## Qué hace

**Cuatro estaciones.** Genética, química molecular, ecosistemas colombianos y las leyes de Newton. Cada una con sus conceptos clave y su propio tutor.

**Tutor con IA de verdad.** Conversación con respuesta en streaming, palabra por palabra, servida por Gemini o por OpenRouter, a elección. Cada estación tiene su propio *system prompt*: el tutor de Newton parte de situaciones cotidianas, el de ecosistemas prioriza el páramo y el bosque andino.

**Laboratorio de Prompts.** El estudiante escribe el prompt que le haría a una IA y esta se lo califica de 0 a 100 sobre cuatro criterios (claridad, especificidad, contexto y formato), le dice qué mejorar y se lo devuelve reescrito. Es el ejercicio central del proyecto: aprender a preguntar, no solo a recibir respuestas.

**Metacognición.** Los cuatro pasos del proceso de verificación y las preguntas de pensamiento crítico sobre el uso ético de la IA.

**Funciona sin internet.** Si no hay conexión en la feria —o si se agota la cuota del día— el tutor responde desde una base de conocimiento guardada en el teléfono, y lo dice con una insignia visible: *"Sin conexión · base local"*. Nunca se hace pasar una respuesta enlatada por una generada.

---

## Cómo está organizado

```
app/       PWA en React + TypeScript, construida con Vite
worker/    Worker de Cloudflare que hace de proxy del proveedor de IA
```

Son dos piezas que se despliegan por separado: la app a GitHub Pages y el Worker a Cloudflare.

### Por qué hace falta un backend

**La API key del proveedor de IA no puede ir en la aplicación.** El sitio es público y su código fuente se lee con dos clics; cualquiera podría copiar la llave y gastar la cuenta del colegio. Por eso existe el Worker: la llave vive solo ahí, como secreto de Cloudflare, y el navegador nunca la ve.

El Worker además protege el presupuesto, algo que importa cuando la dirección del servicio va impresa en un cartel:

- **CORS** restringido al dominio de la app.
- **Límite por ráfaga:** 8 peticiones por minuto y por dispositivo.
- **Presupuesto diario** para todo el sitio, contado en KV. Al agotarse, la app degrada a la base local en vez de romperse.
- **Límites de entrada:** largo del mensaje, turnos de historial y tokens de salida.
- El cliente **nunca elige el modelo ni el system prompt**: solo manda el identificador de la estación.

---

## Ponerlo a andar en tu computador

Hace falta Node 22 o superior.

```bash
# 1. El backend
cd worker
npm install
cp .dev.vars.example .dev.vars     # y pega tu API key del proveedor
npm run dev                        # queda en http://localhost:8787

# 2. La app, en otra terminal
cd app
npm install
echo "VITE_API_URL=http://localhost:8787" > .env.local
echo "VITE_BASE=/" >> .env.local
npm run dev                        # queda en http://localhost:5173
```

Para comprobar que el backend responde, y que además llega al proveedor de IA:

```bash
curl http://localhost:8787/api/health
curl http://localhost:8787/api/diagnostico
```

---

## Publicarlo

### 1. La app (GitHub Pages)

1. En **Settings → Pages**, cambia *Source* a **GitHub Actions**. Este paso es manual y sin él no se publica nada.
2. Empuja a `main`. El workflow construye y publica solo.

Queda en `https://citizen-netizen.github.io/NaturIA/`. Genera el QR con esa dirección.

> Las rutas de GitHub Pages distinguen mayúsculas: el repositorio se llama `NaturIA`, así que `/naturia/` daría 404. Si algún día usan dominio propio, se construye con `VITE_BASE=/`.

Con esto la app ya funciona, pero el tutor responderá siempre desde su base local. Para que use IA hace falta el Worker.

### 2. El Worker de IA, desde el navegador

**No necesitas terminal.** El workflow crea el almacén KV, despliega el Worker y carga la API key por ti. Todo se puede hacer desde un celular.

Hacen falta dos cuentas gratuitas: **Cloudflare** (donde vive el Worker) y un **proveedor de IA**.

#### Qué proveedor elegir

El Worker habla el formato de API de OpenAI, y tanto Gemini como OpenRouter lo exponen. Cambiar de uno a otro es tocar una variable, no reescribir código.

| | Peticiones al día | Por minuto | Tarjeta |
|---|---|---|---|
| **Gemini Flash** (por defecto) | 250 | 10 | no |
| **Gemini Flash-Lite** | 1.000 | 15 | no |
| OpenRouter `:free` | 50 | 20 | no |

**Gemini viene configurado por defecto** porque su nivel gratuito es entre 5 y 20 veces más holgado, que es justo lo que necesita un stand con cola. La API key se saca de [aistudio.google.com](https://aistudio.google.com/), gratis y sin tarjeta.

Dos cosas que conviene saber, porque circula información desactualizada:

- El crédito de 300 USD de Google Cloud **ya no aplica** al Gemini API: quedó excluido en marzo de 2026.
- Los modelos **Pro salieron del nivel gratuito** el 1 de abril de 2026. Gratis quedan Flash y Flash-Lite.

#### Los pasos

**En Cloudflare:**

1. **My Profile → API Tokens → Create Token**, plantilla **Edit Cloudflare Workers**. Ya trae los permisos de Workers Scripts y Workers KV Storage, que son los que hacen falta. Copia el token: solo se muestra una vez.
2. En la página de inicio de tu cuenta, copia el **Account ID**.

**En GitHub → Settings → Secrets and variables → Actions**, pestaña **Secrets**, crea tres:

| Secreto | De dónde sale |
|---|---|
| `CLOUDFLARE_API_TOKEN` | el token del paso 1 |
| `CLOUDFLARE_ACCOUNT_ID` | el Account ID del paso 2 |
| `AI_API_KEY` | tu clave de Google AI Studio (o de OpenRouter) |

**Luego:**

3. **Actions → Desplegar el Worker de IA → Run workflow**.
4. Cuando termine, abre el run: el resumen trae la URL del Worker, algo como `https://naturia-api.tu-cuenta.workers.dev`.
5. **Abre `TU-WORKER.workers.dev/api/diagnostico`.** Hace una llamada real al proveedor y te dice en español si algo falla. No sigas hasta ver `"ok": true`.
6. En **Variables** (la otra pestaña, no Secrets), crea `VITE_API_URL` con la URL del Worker.
7. **Actions → Desplegar la app a GitHub Pages → Run workflow**.

> **El paso 7 no es opcional.** Crear o cambiar una variable **no dispara ningún despliegue** por sí sola. Si te lo saltas, `VITE_API_URL` no entra en la compilación y el tutor seguirá respondiendo desde la base local aunque el Worker esté perfecto. Es el tropiezo más fácil de todo el montaje.

#### Si algo falla

`/api/diagnostico` traduce el problema a algo accionable:

| Causa | Qué hacer |
|---|---|
| `sin_llave` | falta el secreto `AI_API_KEY`; añádelo y relanza el workflow |
| `llave_invalida` | la clave está incompleta, vencida, o es de otro proveedor |
| `sin_creditos` | ese modelo no es gratuito; cambia `MODEL` |
| `modelo_inexistente` | el identificador cambió; busca uno vigente en el catálogo |
| `limite_proveedor` | agotaste la cuota por minuto o por día; espera |
| `presupuesto_agotado` | tu propio `DAILY_BUDGET`; el Worker está bien |

### 3. El Worker desde una terminal (alternativa)

Si prefieres hacerlo a mano:

```bash
cd worker
npx wrangler login

# Crea el almacén donde se lleva la cuenta del presupuesto diario
npx wrangler kv namespace create BUDGET
# Copia el id que imprime y pégalo en wrangler.jsonc, en kv_namespaces[0].id,
# reemplazando REEMPLAZAR_CON_EL_ID_DE_KV

npx wrangler deploy

# La llave queda en Cloudflare, nunca en el repositorio
npx wrangler secret put AI_API_KEY
```

### Ajustes del Worker

En `worker/wrangler.jsonc`, dentro de `vars`:

- `AI_PROVIDER`: `gemini` (por defecto) u `openrouter`.
- `MODEL`: el identificador tal como lo nombra ese proveedor. Con Gemini, `gemini-2.5-flash` o `gemini-2.5-flash-lite`; con OpenRouter, algo terminado en `:free`.
- `ALLOWED_ORIGINS`: los orígenes autorizados, separados por coma y sin barra final.
- `DAILY_BUDGET`: cuántas consultas al modelo se permiten por día en todo el sitio.

El `id` del KV se deja con su marcador a propósito: el workflow lo sustituye durante el despliegue, así que el repositorio nunca guarda identificadores de infraestructura.

**No hay lista blanca de modelos.** El modelo solo lo puede fijar quien tiene acceso al repositorio o a Cloudflare — el navegador nunca lo elige— así que una lista blanca no protegía de nadie, y en cambio escondía las erratas cambiando el modelo por detrás en silencio. Ahora se usa exactamente lo que digas, y `/api/health` avisa si el modelo no parece del nivel gratuito.

---

## Sobre la cuota

`DAILY_BUDGET` está en **200**, deliberadamente por debajo de las 250 diarias de Gemini Flash. Así el freno es el nuestro y no el del proveedor: cuando se alcanza, el visitante recibe una explicación y una respuesta de la base local, en vez de un error crudo.

Si esperan mucha gente, hay dos palancas sin gastar un peso:

- Cambiar `MODEL` a `gemini-2.5-flash-lite` y subir `DAILY_BUDGET` a unas 900. Cuadruplica la capacidad a cambio de respuestas algo más simples.
- Dejar Flash y asumir que, pasadas 200 consultas, el tutor responde desde la base local. Sigue siendo una demostración válida: la sección de metacognición trata precisamente de no depender ciegamente de la IA.

El techo real en un stand con cola no es el diario sino **el de por minuto** (10 con Flash, 15 con Flash-Lite). Cuando se alcanza, la app lo dice con sus palabras — *"hay varias personas preguntando al mismo tiempo"*— y responde desde la base local, para que no parezca que se rompió.

### Comprobar el estado antes de abrir el stand

Abre en el navegador:

```
https://TU-WORKER.workers.dev/api/diagnostico
```

Si dice `"ok": true`, el tutor está listo. Cuesta una petición de la cuota del día.

---

## Cómo usarla en el stand

**Preparación.** Imprime el QR en grande. Ten uno o dos teléfonos con la app ya instalada para quien no quiera usar el suyo.

**Instalarla.** En Android, Chrome ofrece "Instalar aplicación" desde el menú de tres puntos. En iPhone hay que abrirla en Safari y usar Compartir → "Agregar a la pantalla de inicio". Una vez instalada arranca sin conexión.

**La demostración que mejor funciona.** Abre el Laboratorio de Prompts y escribe delante del visitante un prompt vago como *"dime sobre genética"*. Deja que la IA lo califique bajo. Luego usa el prompt reescrito que ella misma propone y muéstrale la diferencia en la respuesta del tutor. Ahí se ve, en vivo, de qué trata el proyecto.

**El cierre.** Lleva la conversación a la sección de metacognición: la IA se equivoca, y lo importante no es la respuesta sino cómo la verificamos.

---

## Notas técnicas

Lo que cambió respecto de la primera versión del proyecto, por si alguien retoma el código:

- **El chatbot anterior no usaba IA.** Era una cadena de comparaciones de texto (`if (pregunta.includes('genetica'))`) que devolvía párrafos fijos. Esos textos no se perdieron: hoy son la base de conocimiento offline de `app/src/data/offlineKnowledge.ts`, que es el papel que sí les corresponde, y siempre se muestran etiquetados.
- **Se eliminó la transpilación en el navegador.** La versión anterior cargaba React, Babel y Tailwind desde CDN y compilaba el JSX en cada visita: alrededor de 1,5 MB de JavaScript antes de dibujar nada. Ahora se compila una sola vez y el paquete ronda los 100 KB comprimidos, con las fuentes reducidas al subconjunto latino.
- **La app tiene rutas de verdad**, así que el botón "atrás" del teléfono funciona y se pueden compartir enlaces a una estación concreta.
- **Modo claro y oscuro**, contraste AA, foco visible por teclado y respeto a `prefers-reduced-motion`.
- **El service worker se rehizo con Workbox.** El anterior devolvía el `index.html` ante cualquier petición fallida, lo que habría entregado HTML a las llamadas de la API. Ahora las rutas de `/api/` están excluidas explícitamente.

### Comandos útiles

```bash
cd app    && npm run build      # compila y verifica tipos
cd app    && npm run preview    # sirve el build, con service worker activo
cd worker && npm run typecheck
cd worker && npm run tail       # registros del Worker en producción
```

---

## Créditos

Proyecto *"NaturIA: uso de aplicaciones basadas en IA para la comprensión de conceptos en Ciencias Naturales"*, Institución Educativa Luis Andrade Valderrama, Giraldo, Antioquia.

Estudiantes y docentes pueden usar, modificar y compartir esta aplicación libremente con fines educativos.
