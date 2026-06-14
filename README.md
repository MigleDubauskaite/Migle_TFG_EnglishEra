# 🌍 English Era

Plataforma educativa multiplatforma para el aprendizaje del inglés, desarrollada como Trabajo de Fin de Grado del ciclo de Desarrollo de Aplicaciones Multiplataforma (DAM).

**Autora:** Miglė Dubauskaitė  
**Centro:** Core Networks Sevilla  
**Curso:** 2024–2026

---

## 📋 Descripción

English Era combina cuatro componentes en un único entorno:

- **Cuestionarios interactivos** organizados por nivel MCER (A1–C2) en gramática, vocabulario, phrasal verbs e idioms, con sistema de puntos de experiencia (XP)
- **Recursos auténticos** — noticias en tiempo real, letras de canciones, PDFs y vídeos clasificados por dificultad
- **Comunidad** — blog con publicaciones y comentarios, eventos presenciales y virtuales
- **Asistente IA** basado en Llama 3.3 (Groq API), con respuestas en inglés y español

---

## 🏗️ Arquitectura

```
English Era
├── backend-tfg/          → Spring Boot (API REST)
│   └── database/
│       └── docker-compose.yml
├── frontend-tfg/         → React + TypeScript (Vite + Tailwind CSS)
└── movil-tfg/            → React Native + Expo (Android / iOS)
```

Ambos clientes (web y móvil) consumen la misma API REST del backend. La autenticación se gestiona con tokens JWT.

---

## 🛠️ Tecnologías

| Capa | Tecnología |
|------|-----------|
| Backend | Spring Boot, Spring Security, Spring Data JPA |
| Base de datos | MySQL 8.0, MongoDB 7 |
| Frontend web | React, TypeScript, Vite, Tailwind CSS, React Router |
| App móvil | React Native, Expo, expo-secure-store, expo-file-system |
| Contenedorización | Docker, Docker Compose |
| IA | Llama 3.3 70B vía Groq API |
| Noticias | NewsAPI.org |

---

## 🚀 Instalación y ejecución local

### Requisitos previos

| Herramienta | Versión | Para qué |
|-------------|---------|----------|
| Docker Desktop | Última | Backend + Frontend web + BBDDs |
| Node.js | 20+ | Solo para la app móvil |

### Pasos (web completa con Docker)

```bash
# 1. Clona el repositorio
git clone https://github.com/MigleDubauskaite/Migle_TFG_EnglishEra.git
cd Migle_TFG_EnglishEra

# 2. Entra a la carpeta de Docker
cd backend-tfg/database

# 3. Levanta todos los servicios
docker compose up -d --build
```

Esto levanta automáticamente: MySQL, MongoDB, el backend Spring Boot, el frontend React y Adminer.

> **Nota sobre puertos:** el frontend corre en el puerto `3000` cuando se usa Docker. Si lo ejecutas con `npm run dev` directamente, Vite usará el puerto `5173`.

---

## 🔑 Variables de entorno (API Keys)

El proyecto usa dos servicios externos que requieren API keys gratuitas:

| Servicio | Para qué | Dónde obtenerla |
|----------|----------|-----------------|
| Groq | Asistente IA (Llama 3.3) | https://console.groq.com/keys |
| NewsAPI | Noticias en tiempo real | https://newsapi.org |

Una vez obtenidas, añádelas en `backend-tfg/database/docker-compose.yml`:

```yaml
environment:
  GROQ_API_KEY: "tu_groq_key_aqui"
  NEWSAPI_KEY: "tu_newsapi_key_aqui"
```

> Sin estas keys el resto de la plataforma funciona con normalidad. Solo el asistente IA y la sección de noticias quedarán sin datos.

---

## 🌐 URLs de acceso

Una vez levantado con Docker:

| Servicio | URL |
|----------|-----|
| Frontend web | http://localhost:3000 |
| Backend (Swagger) | http://localhost:8080/swagger-ui/index.html |
| Adminer (gestión BD) | http://localhost:8082 |

### Credenciales Adminer

| Campo | Valor |
|-------|-------|
| Sistema | MySQL |
| Servidor | mysql-db |
| Usuario | root |
| Contraseña | root123 |
| Base de datos | tfg_english_db |

---

## 🔐 Credenciales de prueba

Creadas automáticamente por el `DataLoader` al arrancar:

| Rol | Email | Contraseña |
|-----|-------|------------|
| Administrador | admin@gmail.com | admin123 |
| Usuario estándar | student@tfg.com | pass123 |

---

## 📱 Aplicación móvil

La app móvil está desarrollada con React Native + Expo y probada en Android (emulador y dispositivo físico).

### APK

> **APK:** https://expo.dev/artifacts/eas/0eg2Q3cMsmioVG7sx9LkXTbTizPFtEPJpDc32Lbu1oY.apk

Para generar la APK tú mismo:

```bash
cd movil-tfg
eas build --platform android --profile preview
```

### Ejecutar en desarrollo

```bash
cd movil-tfg
npm install
npx expo start
```

### Conectar con el backend

La app móvil necesita apuntar al backend. Si el backend corre en Docker (`localhost:8080`), un dispositivo físico no puede acceder a ese `localhost` directamente.

**Solución con ngrok:**

1. Crea una cuenta gratuita en [ngrok.io](https://ngrok.io) y ejecuta una vez:
   ```bash
   ngrok config add-authtoken <tu-token>
   ```

2. Expón el backend:
   ```bash
   ngrok http 8080
   ```

3. Copia la URL generada (`https://xxxx.ngrok-free.app`) y pégala en `movil-tfg/src/api/client.ts` línea 6:
   ```ts
   : 'https://xxxx.ngrok-free.app'; // ← pega aquí tu URL ngrok
   ```

4. Arranca la app:
   ```bash
   npx expo start --tunnel
   ```

---

## 👤 Roles de usuario

| Rol | Acceso |
|-----|--------|
| Usuario estándar | Cuestionarios, recursos, comunidad, perfil, asistente IA |
| Administrador | Todo lo anterior + panel de administración (usuarios, preguntas, publicaciones, comentarios) |

---

## 📊 Sistema de progresión MCER

| Nivel | XP necesario |
|-------|-------------|
| A1 → A2 | 500 XP |
| A2 → B1 | 1.500 XP |
| B1 → B2 | 3.000 XP |
| B2 → C1 | 5.000 XP |
| C1 → C2 | 8.000 XP |

Cada respuesta correcta en un cuestionario otorga **10 XP**.

---

## 📁 Estructura del proyecto

```
backend-tfg/
├── src/main/java/         → Controladores, servicios, repositorios, entidades
├── src/main/resources/    → application.properties
├── Dockerfile
└── database/
    └── docker-compose.yml

frontend-tfg/
├── src/
│   ├── pages/             → Home, Quiz, Resources, Blog, Events, Profile, Admin, Login, Register
│   ├── components/        → Navbar, Footer, ChatWidget, componentes reutilizables
│   └── api/               → Módulo cliente centralizado (inyección JWT, manejo 401/403)
├── Dockerfile
└── package.json

movil-tfg/
├── app/                   → Pantallas y navegación (Stack + Tab navigator)
├── components/            → Componentes reutilizables
└── package.json
```

---

## 📄 Licencia

Proyecto académico — TFG DAM, Core Networks Sevilla, 2026.
