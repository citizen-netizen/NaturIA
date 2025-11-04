# NaturIA - Aplicación Educativa de IA para Ciencias Naturales

## Descripción del Proyecto

NaturIA es una aplicación web progresiva (PWA) diseñada para el proyecto de Feria de la Ciencia de la Institución Educativa Luis Andrade Valderrama de Giraldo, Antioquia. Esta aplicación combina el poder de la Inteligencia Artificial con conceptos fundamentales de Ciencias Naturales, promoviendo un aprendizaje crítico y reflexivo.

## Características Principales

La aplicación incluye tres componentes fundamentales que responden a los objetivos del proyecto educativo:

### 1. Estaciones Interactivas
Cuatro estaciones temáticas que cubren conceptos complejos de Ciencias Naturales:

**El Código de la Vida (Genética)**: Explora la herencia genética, enfermedades hereditarias como el daltonismo, y cómo los genes determinan nuestras características. Los estudiantes aprenderán sobre cromosomas, genes dominantes y recesivos, y patrones de herencia ligados al sexo.

**Zoom Atómico (Química Molecular)**: Descubre la estructura de la materia a nivel microscópico. Los visitantes pueden explorar cómo los átomos forman moléculas como el agua (H₂O), entender enlaces químicos, y visualizar estructuras tridimensionales que determinan las propiedades de las sustancias.

**Ecosistemas del Futuro (Biodiversidad)**: Sumérgete en los ecosistemas colombianos únicos como páramos, selvas amazónicas y arrecifes de coral. Aprende sobre biodiversidad, interdependencia de especies, y los efectos del cambio climático en estos delicados equilibrios.

**Newton en Acción (Física)**: Experimenta con las tres leyes de Newton que gobiernan el movimiento. Los estudiantes pueden relacionar conceptos abstractos de física con situaciones cotidianas como viajar en bus, jugar deportes o caminar.

### 2. Chatbot Educativo Inteligente
Un asistente conversacional diseñado específicamente para responder preguntas sobre los cuatro temas principales del proyecto. El chatbot incluye una funcionalidad educativa única: una guía interactiva sobre cómo crear prompts efectivos. Los estudiantes aprenden la diferencia entre preguntas vagas ("Dime sobre genética") y prompts bien estructurados ("Explícame cómo funciona la herencia del daltonismo usando un ejemplo de árbol genealógico").

El chatbot proporciona respuestas educativas detalladas adaptadas al nivel de estudiantes de secundaria, usando analogías comprensibles y ejemplos locales cuando es apropiado. Cada respuesta incluye una invitación a profundizar más, fomentando la curiosidad científica.

### 3. Proceso de Metacognición
Esta sección implementa el modelo de pensamiento crítico del proyecto original, mostrando los cuatro pasos del proceso de aprendizaje con IA:

**Paso 1 - Nuestra duda era**: Los estudiantes identifican qué no comprenden o qué desean investigar, formulando una pregunta clara de investigación.

**Paso 2 - Le pedimos a la IA que**: Se diseña un prompt específico y bien estructurado, aplicando las técnicas aprendidas en la guía de prompts del chatbot.

**Paso 3 - La IA nos respondió**: Se recibe y analiza la respuesta generada por la inteligencia artificial, identificando los conceptos clave y la información proporcionada.

**Paso 4 - Nosotros lo comprobamos/complementamos con**: Se verifica la información usando fuentes confiables, experimentos físicos, consultas con el profesor, y pensamiento crítico para validar o complementar lo aprendido.

La sección también incluye reflexiones sobre el uso ético y responsable de la IA, respondiendo preguntas fundamentales como "¿La IA siempre tiene razón?", "¿La IA reemplaza al profesor?", y "¿Qué aprendemos al usar IA conscientemente?".

## Características Técnicas (PWA)

Esta es una aplicación web progresiva completa, lo que significa que puede instalarse en cualquier dispositivo Android (o iOS, o computadora) y funcionar como una aplicación nativa. Las características técnicas incluyen:

**Instalación en pantalla de inicio**: Los usuarios pueden agregar un ícono de NaturIA directamente a la pantalla de inicio de su teléfono, permitiendo acceso rápido sin abrir el navegador.

**Funcionamiento sin conexión**: Una vez instalada, la aplicación funciona completamente sin conexión a internet gracias al service worker que cachea todos los recursos necesarios.

**Diseño responsivo**: La interfaz se adapta perfectamente a cualquier tamaño de pantalla, desde teléfonos móviles pequeños hasta tablets y computadoras de escritorio.

**Experiencia de pantalla completa**: Al abrirse desde el ícono de inicio, la aplicación ocupa toda la pantalla sin mostrar las barras del navegador, proporcionando una experiencia inmersiva similar a una app nativa.

**Rendimiento optimizado**: La aplicación carga rápidamente y responde de manera fluida gracias al uso de React y técnicas de optimización de rendimiento.

## Cómo Usar la Aplicación en la Feria

### Para los Organizadores

1. **Descargar los archivos**: Todos los archivos necesarios (index.html, manifest.json, service-worker.js) están listos para usar.

2. **Alojar la aplicación**: Tienen tres opciones principales para hacer que la aplicación sea accesible durante la feria:

   **Opción A - GitHub Pages (Recomendada, Gratuita)**:
   - Crear una cuenta gratuita en GitHub si aún no tienen una
   - Crear un nuevo repositorio público llamado "naturia"
   - Subir todos los archivos al repositorio
   - Ir a Settings → Pages y activar GitHub Pages desde la rama main
   - En unos minutos tendrán una URL como: https://tu-usuario.github.io/naturia/
   - Esta URL funcionará desde cualquier dispositivo con internet

   **Opción B - Netlify (Gratuita, Muy Fácil)**:
   - Ir a netlify.com y crear una cuenta gratuita
   - Hacer clic en "Add new site" → "Deploy manually"
   - Arrastrar la carpeta con todos los archivos
   - Netlify generará una URL automáticamente que pueden compartir

   **Opción C - Servidor Local (Sin Internet)**:
   - Si la feria no tiene buena conexión a internet, pueden usar un servidor local
   - En una computadora con Python instalado, navegar a la carpeta con los archivos
   - Ejecutar: `python -m http.server 8000`
   - Los dispositivos móviles en la misma red WiFi podrán acceder usando la IP de la computadora

3. **Crear código QR**: Una vez tengan la URL, generar un código QR usando cualquier generador en línea (como qr-code-generator.com). Imprimir este código QR en tamaño grande para colocarlo en el stand de la feria.

4. **Preparar dispositivos de demostración**: Si es posible, tener 1-2 tablets o teléfonos con la aplicación ya instalada para que los visitantes puedan interactuar sin usar sus propios dispositivos.

### Para los Visitantes de la Feria

1. **Acceder a la aplicación**:
   - Escanear el código QR con la cámara del teléfono
   - O visitar directamente la URL proporcionada por los organizadores
   - La aplicación se abrirá inmediatamente en el navegador

2. **Instalar en el teléfono (Opcional pero recomendado)**:
   
   **En Android**:
   - Una vez abierta la aplicación en Chrome, aparecerá un mensaje emergente en la parte inferior que dice "Agregar a la pantalla de inicio"
   - Si no aparece, tocar el menú de tres puntos (⋮) en la esquina superior derecha
   - Seleccionar "Agregar a la pantalla de inicio" o "Instalar aplicación"
   - Confirmar la instalación
   - ¡Listo! Ahora tendrán un ícono de NaturIA en su pantalla de inicio

   **En iPhone/iPad**:
   - Abrir la aplicación en Safari (debe ser Safari, no funciona en Chrome para iOS)
   - Tocar el botón de compartir (el cuadrado con flecha hacia arriba)
   - Desplazarse hacia abajo y tocar "Agregar a la pantalla de inicio"
   - Confirmar
   - El ícono aparecerá en la pantalla de inicio

3. **Explorar la aplicación**:
   - Desde la pantalla principal, elegir entre tres opciones: explorar las estaciones interactivas, usar el chatbot educativo, o aprender sobre el proceso de metacognición
   - En cada estación, leer la introducción, revisar los conceptos clave, y luego opcionalmente ir al chatbot para hacer preguntas específicas
   - En el chatbot, hacer clic en "Guía: Cómo hacer buenos prompts" para aprender a formular mejores preguntas antes de empezar a interactuar
   - Explorar la sección de metacognición para entender el proceso completo de aprendizaje crítico con IA

## Consejos para la Presentación en la Feria

**Preparar un guion de presentación**: Los estudiantes encargados de cada estación deben preparar una breve explicación de 2-3 minutos sobre su tema, que puede complementar con la información en la aplicación.

**Demostración en vivo del chatbot**: Mostrar a los visitantes cómo hacer una pregunta vaga primero y luego mostrar cómo mejorarla usando las técnicas de la guía de prompts, demostrando así la diferencia en calidad de las respuestas.

**Conectar lo físico con lo digital**: Si tienen maquetas, experimentos o materiales físicos complementarios (como se sugiere en el proyecto original), usar la aplicación para proporcionar información adicional que complementa lo que los visitantes pueden tocar y ver.

**Énfasis en pensamiento crítico**: Usar la sección de metacognición para liderar una discusión sobre cómo NO confiar ciegamente en la IA, mostrando ejemplos de cómo verificaron la información y por qué es importante hacerlo.

**Recopilar feedback**: Pedir a los visitantes que compartan qué estación les gustó más y por qué, o qué aprend ieron nuevo. Esta retroalimentación puede ser valiosa para el informe final del proyecto.

## Estructura de Archivos

El proyecto consiste en tres archivos principales que trabajan juntos:

**index.html**: Es el archivo principal que contiene toda la estructura y lógica de la aplicación. Incluye el código HTML, el componente React completo, y todos los estilos necesarios. Este archivo es completamente autosuficiente y puede funcionar por sí solo.

**manifest.json**: Define cómo se comporta la aplicación cuando se instala como PWA. Especifica el nombre, los íconos, los colores del tema, y otras configuraciones que hacen que la aplicación se vea y funcione como una app nativa.

**service-worker.js**: Maneja el funcionamiento sin conexión. Este archivo JavaScript se ejecuta en segundo plano y cachea todos los recursos necesarios para que la aplicación funcione incluso cuando no hay internet disponible.

## Soporte y Personalización

Esta aplicación está diseñada para ser modificable. Si desean agregar más contenido a las estaciones, cambiar los ejemplos del chatbot, o incluir información adicional en la sección de metacognición, pueden editar directamente el archivo index.html. El código está comentado y organizado de manera clara para facilitar las modificaciones.

Si necesitan ayuda técnica o quieren agregar funcionalidades adicionales, pueden volver a consultar con quien les ayudó a crear esta aplicación. Algunas posibles extensiones futuras podrían incluir la integración con APIs de IA reales, la adición de más estaciones temáticas, o la inclusión de videos y animaciones educativas.

## Licencia y Créditos

Esta aplicación fue creada específicamente para el proyecto "NaturIA: uso de aplicaciones basadas en IA para la comprensión de conceptos en Ciencias Naturales" de la Institución Educativa Luis Andrade Valderrama, Giraldo, Antioquia.

Los estudiantes y docentes son libres de usar, modificar y compartir esta aplicación para propósitos educativos.

## Contacto

Para soporte técnico o preguntas sobre la aplicación, contactar a los docentes responsables del proyecto en la Institución Educativa Luis Andrade Valderrama.

---

¡Éxitos en la Feria de la Ciencia! Este proyecto representa un uso innovador y crítico de la tecnología para el aprendizaje de las ciencias naturales.
