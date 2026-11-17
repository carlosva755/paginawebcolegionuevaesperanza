# Especificación de APIs RESTful - Plataforma de Alerta Temprana y Acompañamiento
**Versión de API:** `v1`  
**Convención:** JSON sobre HTTPS / HTTP, autenticación mediante Bearer JWT en cabecera `Authorization`.

---

## 1. Microservicio 1: alertas-service (C# .NET 8 Web API)
**Puerto de escucha:** `5001` (mapeado a `8080` en contenedor)  
**Base URL:** `http://localhost:5001/api/v1`

| Método | Ruta | Roles Autorizados | Descripción | Códigos HTTP |
|---|---|---|---|---|
| `POST` | `/auth/login` | Público | Autentica usuario y emite JWT con claims y rol. | 200, 401 |
| `POST` | `/students` | Administrador, Orientador | Registra nuevo estudiante con datos de contacto de acudiente. | 201, 400, 401, 403 |
| `GET` | `/students` | Todos (autenticados) | Lista estudiantes con filtro opcional `?grade=8-A`. | 200, 401 |
| `GET` | `/students/{studentId}` | Todos (autenticados) | Ficha detallada con balance de inasistencias y nota ética obligatoria. | 200, 404, 401 |
| `POST` | `/attendance` | Docente, Administrador | Registra asistencia diaria (Presente, Ausente, Tarde, Justificada). Dispara recálculo automático. | 200, 201, 400, 401, 403 |
| `GET` | `/attendance/{studentId}` | Docente, Orientador, Admin, Estudiante | Consulta historial completo de asistencia del estudiante. | 200, 404, 401 |
| `POST` | `/surveys/responses` | Estudiante, Orientador, Admin | Guarda respuesta a la encuesta de bienestar (12 preguntas) y recalcula riesgo. | 201, 400, 401 |
| `GET` | `/surveys/responses/{studentId}` | Orientador, Admin, Estudiante | Consulta respuestas de bienestar previas del estudiante. | 200, 404, 401 |
| `GET` | `/risk-alerts` | Orientador, Admin, Docente | Lista alertas activas con filtros: `?level=high&grade=8-A`. | 200, 401, 403 |
| `POST` | `/risk-alerts/recalculate` | Administrador, Orientador | Ejecuta recálculo masivo de riesgo en base de datos. | 200, 401, 403 |
| `PATCH`| `/risk-alerts/{id}/acknowledge`| Orientador, Administrador | Marca una alerta como atendida/revisada por orientación. | 200, 404, 401 |

---

## 2. Microservicio 2: acompanamiento-service (Node.js + Express)
**Puerto de escucha:** `5002` (mapeado a `3000` en contenedor)  
**Base URL:** `http://localhost:5002/api/v1`

| Método | Ruta | Roles Autorizados | Descripción | Códigos HTTP |
|---|---|---|---|---|
| `POST` | `/auth/login` | Público | Autentica usuario en acompañamiento y emite JWT. | 200, 401 |
| `POST` | `/cases` | Orientador, Administrador | Abre caso de acompañamiento escolar vinculado a alerta. | 201, 400, 401, 403 |
| `GET` | `/cases` | Orientador, Directivo, Admin, Docente | Lista casos con filtros `?status=EnSeguimiento&priority=Alta`. | 200, 401, 403 |
| `GET` | `/cases/{caseId}` | Orientador, Directivo, Admin, Responsable | Detalle del caso con sus acciones y notificaciones. | 200, 404, 401, 403 |
| `PATCH`| `/cases/{caseId}` | Orientador, Administrador | Actualiza estado (EnSeguimiento, CerradoExitosa, etc.) y notas de cierre. | 200, 404, 401, 403 |
| `POST` | `/cases/{caseId}/actions` | Orientador, Administrador | Añade una acción al plan de intervención del caso. | 201, 400, 404, 401, 403 |
| `PATCH`| `/cases/{caseId}/actions/{actionId}` | Responsable, Orientador, Admin | Actualiza avance, estado (Completada) y sube evidencia textual. | 200, 404, 401, 403 |
| `POST` | `/notifications` | Orientador, Directivo, Admin | Registra solicitud de notificación a acudiente (WhatsApp, SMS, etc.). | 201, 400, 401, 403 |
| `GET` | `/notifications` | Orientador, Directivo, Admin | Historial de auditoría de comunicaciones enviadas a familias. | 200, 401, 403 |
| `GET` | `/dashboard/indicators` | Directivo, Orientador, Admin, Docente | KPIs institucionales agregados (ausencias reiteradas, planes completados, tiempo de contacto). | 200, 401, 403 |
| `GET` | `/reports/retention` | Directivo, Orientador, Admin | Alias institucional para indicadores de retención. | 200, 401, 403 |
