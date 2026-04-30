COMANDOS DE DOCKER PARA DEPLOYMENT

Ubicacion:
Situate en la carpeta D:\softskills\softskills-demo-jwt\deployment

1. Preparar artefactos antes de construir

   Ejecuta:
   powershell -ExecutionPolicy Bypass -File .\prepare-deployment.ps1

   Esto copia:
   - la dist del frontend a deployment\frontend\app
   - el jar del backend a deployment\backend\app\softskills.jar, si existe en la ruta esperada

2. Levantar despliegue normal con base de datos externa

   Construir y arrancar:
   docker compose up -d --build

   Arrancar sin reconstruir:
   docker compose up -d

3. Levantar despliegue local con MySQL incluido

   Construir y arrancar:
   docker compose -f docker-compose.yml -f docker-compose.local.yml up -d --build

   Arrancar sin reconstruir:
   docker compose -f docker-compose.yml -f docker-compose.local.yml up -d

4. Ver logs

   Todos los servicios:
   docker compose logs -f

   Solo backend:
   docker compose logs -f api

   Solo frontend:
   docker compose logs -f frontend

   Solo mysql en modo local:
   docker compose -f docker-compose.yml -f docker-compose.local.yml logs -f mysql

5. Reconstruir un servicio concreto

   Backend:
   docker compose build api

   Frontend:
   docker compose build frontend

   Con mysql local:
   docker compose -f docker-compose.yml -f docker-compose.local.yml build

6. Reiniciar un servicio concreto

   Backend:
   docker compose up -d --build api

   Frontend:
   docker compose up -d --build frontend

7. Parar y eliminar contenedores

   Despliegue normal:
   docker compose down

   Despliegue local con mysql:
   docker compose -f docker-compose.yml -f docker-compose.local.yml down

8. Parar y eliminar tambien volumenes

   Despliegue local con mysql:
   docker compose -f docker-compose.yml -f docker-compose.local.yml down -v

9. Ver estado de los contenedores

   docker compose ps

10. Rutas utiles

   Logs del backend en fichero:
   D:\softskills\softskills-demo-jwt\deployment\logs\api\application.log

   Ficheros del frontend copiados para la imagen:
   D:\softskills\softskills-demo-jwt\deployment\frontend\app

   Jar del backend usado por la imagen:
   D:\softskills\softskills-demo-jwt\deployment\backend\app\softskills.jar

11. URLs habituales

   Frontend:
   http://localhost:8081

   API:
   http://localhost:8080

   MySQL local expuesto al host:
   localhost:3308
