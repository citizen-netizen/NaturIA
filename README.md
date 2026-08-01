# NaturIA

Aplicación web educativa de Ciencias Naturales con inteligencia artificial real, para la Feria de la Ciencia de la **Institución Educativa Luis Andrade Valderrama** (Giraldo, Antioquia).

Los visitantes escanean un código QR en el stand, la app se abre en su celular y pueden conversar con un tutor de IA especializado en cada estación, poner a prueba sus propios prompts, y entender por qué nunca hay que creerle a la IA a la primera.

---

## Qué hace

**Cuatro estaciones.** Genética, química molecular, ecosistemas colombianos y las leyes de Newton. Cada una con sus conceptos clave y su propio tutor.

**Tutor con IA de verdad.** Conversación con respuesta en streaming, palabra por palabra, a través de un modelo servido por OpenRouter. Cada estación tiene su propio *system prompt*: el tutor de Newton parte de situaciones cotidianas, el de ecosistemas prioriza el páramo y el bosque andino.

**Laboratorio de Prompts.** El estudiante escribe el prompt que le haría a una IA y esta se lo califica de 0 a 100 sobre cuatro criterios (claridad, especificidad, contexto y formato), le dice qué mejorar y se lo devuelve reescrito. Es el ejercicio central del proyecto: aprender a preguntar, no solo a recibir respuestas.

**Metacognición.** Los cuatro pasos del proceso de verificación y las preguntas de pensamiento crítico sobre el uso ético de la IA.

**Funciona sin internet.** Si no hay conexión en la feria —o si se agota la cuota del día— el tutor responde desde una base de conocimiento guardada en el teléfono, y lo dice con una insignia visible: *"Sin conexión · base local"*. Nunca se hace pasar una respuesta enlatada por una generada.

---

## Cómo está organizado

```
app/       PWA en React + TypeScript, construida con Vite
worker/    Worker de Cloudflare que hace de proxy de OpenRouter
```

Son dos piezas que se despliegan por separado: la app a GitHub Pages y el Worker a Cloudflare.

### Por qué hace falta un backend

**La API key de OpenRouter no puede ir en la aplicación.** El sitio es público y su código fuente se lee con dos clics; cualquiera podría copiar la llave y gastar la cuenta del colegio. Por eso existe el Worker: la llave vive solo ahí, como secreto de Cloudflare, y el navegador nunca la ve.

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
cp .dev.vars.example .dev.vars     # y pega tu API key de OpenRouter
npm run dev                        # queda en http://localhost:8787

# 2. La app, en otra terminal
cd app
npm install
echo "VITE_API_URL=http://localhost:8787" > .env.local
echo "VITE_BASE=/" >> .env.local
npm run dev                        # queda en http://localhost:5173
```

Para comprobar que el backend responde:

```bash
curl http://localhost:8787/api/health
```

---

## Publicarlo

### 1. El Worker (Cloudflare)

Necesitas una cuenta gratuita en Cloudflare.

```bash
cd worker
npx wrangler login

# Crea el almacén donde se lleva la cuenta del presupuesto diario
npx wrangler kv namespace create BUDGET
# Copia el id que imprime y pégalo en wrangler.jsonc, en kv_namespaces[0].id

# Carga la llave. Queda guardada en Cloudflare, nunca en el repositorio.
npx wrangler secret put OPENROUTER_API_KEY

npx wrangler deploy
```

Anota la URL que devuelve (algo como `https://naturia-api.tu-cuenta.workers.dev`) y ajusta en `wrangler.jsonc`:

- `ALLOWED_ORIGINS`: el dominio de la app, sin barra final.
- `DAILY_BUDGET`: cuántas consultas al modelo permites por día.
- `MODEL`: debe ser uno de la lista blanca de `worker/src/openrouter.ts`.

### 2. La app (GitHub Pages)

1. En **Settings → Pages**, cambia *Source* a **GitHub Actions**. Este paso es manual y sin él no se publica nada.
2. En **Settings → Secrets and variables → Actions → Variables**, crea la variable `VITE_API_URL` con la URL del Worker.
3. Empuja a `main`. El workflow construye y publica solo.

Queda en `https://citizen-netizen.github.io/NaturIA/`. Genera el QR con esa dirección.

> Las rutas de GitHub Pages distinguen mayúsculas: el repositorio se llama `NaturIA`, así que `/naturia/` daría 404. Si algún día usan dominio propio, se construye con `VITE_BASE=/`.

### 3. Despliegue automático del Worker (opcional)

Si añades los secretos `CLOUDFLARE_API_TOKEN` y `CLOUDFLARE_ACCOUNT_ID` al repositorio, el Worker también se despliega solo al tocar `worker/`. Sin esos secretos el workflow no falla: simplemente se salta ese paso.

---

## Antes de la feria: decidan la cuota

Esto hay que resolverlo con tiempo, porque condiciona la experiencia del stand.

El nivel gratuito de OpenRouter permite **50 peticiones al día** si la cuenta tiene saldo bajo, y **20 por minuto** en los modelos con sufijo `:free`. Una feria con varias decenas de visitantes se come 50 peticiones en la primera media hora, y a partir de ahí todos verían respuestas de la base local.

Dos caminos:

- **Comprar 10 USD una sola vez.** Los créditos no expiran y el tope diario sube a 1000 peticiones. Es la opción recomendada.
- **Usar un modelo de pago barato** y fijar `DAILY_BUDGET` según lo que estén dispuestos a gastar.

En cualquier caso, `DAILY_BUDGET` es el freno de mano: cuando se alcanza, el Worker deja de llamar al modelo y la app sigue funcionando con su base local.

### Comprobar el estado antes de abrir el stand

```bash
curl https://TU-WORKER.workers.dev/api/health
```

Si responde `"configured": true`, el tutor está listo.

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
