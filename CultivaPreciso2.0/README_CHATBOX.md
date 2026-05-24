# Chatbox de Enfermedades de Cacao - Instrucciones de Uso

## 🚀 Configuración Inicial

### 1. Obtener la API Key de Google Gemini

1. Ve a [https://makersuite.google.com/app/apikey](https://makersuite.google.com/app/apikey)
2. Inicia sesión con tu cuenta de Google
3. Haz clic en **"Create API Key"** (Crear clave de API)
4. Selecciona o crea un proyecto de Google Cloud
5. Copia la API key generada

### 2. Configurar el Archivo .env

1. En la raíz del proyecto, renombra el archivo `.env.example` a `.env`
2. Reemplaza `tu_api_key_aqui` con tu API key de Gemini:

```env
VITE_GEMINI_API_KEY=tu_api_key_real_aqui
```

3. Guarda el archivo

### 3. Reiniciar el Servidor de Desarrollo

Si el servidor está corriendo, deténlo y reinícialo para que cargue las variables de entorno:

```bash
npm run dev
```

## 📋 Características del Chatbox

### Funcionalidades

- **Diagnóstico visual de enfermedades**: Sube fotos de plantas o frutos de cacao para análisis
- **Preguntas sobre agricultura de precisión**: Sensores, IoT, monitoreo, automatización
- **Identificación de enfermedades específicas**: 
  - Moniliasis (Moniliophthera roreri)
  - Escoba de Bruja (Crinipellis perniciosa)
  - Pudrición Parda de la Mazorca (Phytophthora sp.)
  - Mal de Machete (Ceratocystis fimbriata)
  - Rosellinia (Rosellinia sp.)
- **Recomendaciones de manejo**: Basadas en cada enfermedad específica

### Restricciones

El chatbox **solo responde** preguntas sobre:
- Agricultura de precisión
- Enfermedades y plagas del cultivo de cacao
- Diagnóstico visual de síntomas en plantas de cacao
- Manejo integrado de plagas y enfermedades en cacao

Si haces preguntas fuera de estos temas, el asistente te indicará cortésmente que solo puede responder sobre agricultura de precisión y enfermedades del cacao.

## ⚠️ Descargo de Responsabilidad Importante

**El análisis de la IA es orientativo y preliminar.**

Siempre debes consultar con:
- Un agrónomo certificado
- Un especialista en fitosanidad
- Un técnico agrícola calificado

Para obtener un diagnóstico definitivo y tratamiento adecuado. La IA puede proporcionar orientación inicial pero no reemplaza el juicio profesional.

## 🖼️ Cómo Usar el Chatbox

### Subir una Imagen

1. Haz clic en el botón flotante verde en la esquina inferior derecha (icono de chat)
2. En el área de texto, haz clic en "Clic o arrastra una imagen aquí"
3. Selecciona una foto de tu planta o fruto de cacao afectado
4. Opcionalmente, agrega un texto describiendo los síntomas
5. Haz clic en el botón de enviar (flecha)

### Hacer una Pregunta

1. Abre el chatbox
2. Escribe tu pregunta sobre agricultura de precisión o enfermedades de cacao
3. Haz clic en el botón de enviar

## 🔧 Solución de Problemas

### Error: "API key no configurada"

- Verifica que hayas creado el archivo `.env`
- Asegúrate de que el archivo se llame exactamente `.env` (no `.env.txt`)
- Verifica que la API key esté correctamente copiada
- Reinicia el servidor de desarrollo

### Error: "Error en la API de Gemini"

- Verifica que tu API key sea válida
- Asegúrate de tener conexión a internet
- Verifica que tu cuenta de Google tenga acceso a la API de Gemini

### La imagen no se analiza

- Asegúrate de que la imagen sea clara y esté bien iluminada
- Verifica que la imagen muestre claramente los síntomas
- Intenta con otra foto desde un ángulo diferente

## 📞 Soporte

Si tienes problemas técnicos con la configuración, revisa:
1. Que el archivo `.env` exista en la raíz del proyecto
2. Que la API key sea válida y esté correctamente configurada
3. Que el servidor de desarrollo esté corriendo

## 🔒 Seguridad

- **Nunca compartas** tu archivo `.env` con nadie
- **Nunca subas** tu archivo `.env` a GitHub o repositorios públicos
- El archivo `.env` está incluido en `.gitignore` por seguridad
- Si accidentalmente subes tu API key, revócala inmediatamente en [Google Cloud Console](https://console.cloud.google.com/)
