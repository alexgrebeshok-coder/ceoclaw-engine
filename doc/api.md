# CEOClaw API Documentation (OpenAPI 3.0)

## Overview
CEOClaw API предоставляет доступ к функциональности дашборда для внешних агентов и интеграций.

### Authentication
Требуется Bearer Token (DASHBOARD_API_KEY) в заголовке `Authorization`.

## Endpoints

### 1. Projects
*   `GET /api/projects` — Список всех проектов
*   `POST /api/projects` — Создать проект
*   `GET /api/projects/:id` — Детали проекта
*   `PUT /api/projects/:id` — Обновить проект
*   `DELETE /api/projects/:id` — Удалить проект

### 2. Tasks
*   `GET /api/tasks` — Список задач
*   `POST /api/tasks` — Создать задачу
*   `PUT /api/tasks/:id` — Обновить задачу

### 3. Analytics
*   `GET /api/analytics/overview` — Health scores & project status
*   `GET /api/analytics/team-performance` — Member statistics
*   `GET /api/analytics/predictions` — Finish date & budget risk
*   `GET /api/analytics/recommendations` — Actionable suggestions

### 4. Notifications
*   `GET /api/notifications` — Получить уведомления
*   `PUT /api/notifications/:id/read` — Пометить как прочитанное

### 5. Import Pipeline
*   `POST /api/import/validate` — Валидировать набор import-файлов и получить список распознанных файлов, ошибок и предупреждений
*   `POST /api/import/preview` — Построить normalized preview для WBS, Budget Plan, Risk Register, Payment History, Worklog Summary и Main Contract placeholder

### Import Request Formats
Поддерживаются два варианта запроса:

1. `multipart/form-data`
   Поле `files` может быть передано несколько раз.

2. `application/json`
   ```json
   {
     "files": [
       {
         "name": "WBS.xlsx",
         "mimeType": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
         "contentBase64": "..."
       },
       {
         "name": "Budget_Plan.csv",
         "mimeType": "text/csv",
         "text": "Статья;Сумма\nПодготовка;120000"
       }
     ]
   }
   ```

For detailed OpenAPI specification, see `openapi.yaml`.
