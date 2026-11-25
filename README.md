# Cielo Abierto

Aplicación web full-stack para la gestión de eventos astronómicos, catálogo de objetos celestes, membresías e inscripciones con control de cupos y descuentos.
![Diagrama Cielo Abierto|700](./cielo_abierto.svg)
## Características principales

* **Catálogo de Objetos Astronómicos (`/api/object`):** CRUD completo con validación de unicidad por código (`code`) y nombre (`name`).

* **Gestión de Eventos (`/api/event`):** Creación, edición y consulta de eventos generales o astronómicos (vinculados obligatoriamente a un objeto celeste), además de publicación autenticada por miembros (`/api/event/publish`).

* **Membresías (`/api/membership`):** Registro de miembros con generación automática de código único de 6 dígitos, descuento por defecto del `10%` y vigencia inicial de 1 mes.

* **Control de Asistencia y Aforo (`/api/attendance`):**

  * Registro de inscripciones con generación de código único (`ATT-XXXXXX`).

  * Cálculo y validación en tiempo real de capacidad máxima (`maximumCapacity`) excluyendo registros cancelados (`attendanceStatus = 0`).

  * Portal de autogestión para miembros (`/api/attendance/member/...`) para consultar perfiles, listar reservas y modificar cupos o cancelar asistencias con recálculo automático de tarifa.

* **Frontend integrado:** Archivos estáticos servidos directamente desde `src/main/resources/static` bajo el mismo origen del backend.

## Stack tecnológico

* **Backend:** Java 17+, Spring Boot (Spring Web, Spring Data JPA)

* **Base de datos:** MySQL / Base de datos relacional compatible con JPA

* **Frontend:** HTML5, CSS3, JavaScript Vanilla (`src/main/resources/static`)

* **Gestor de dependencias:** Maven

## Estructura del proyecto

```
src/
└── main/
    ├── java/com/cieloabierto/work/
    │   ├── controller/
    │   │   ├── AstronomicalObjectController.java
    │   │   ├── EventAttendanceController.java
    │   │   ├── EventController.java
    │   │   └── MembershipController.java
    │   ├── model/
    │   │   ├── AstronomicalObject.java
    │   │   ├── Event.java
    │   │   ├── EventAttendance.java
    │   │   └── Membership.java
    │   └── repository/
    │       ├── AstronomicalObjectRepository.java
    │       ├── EventAttendanceRepository.java
    │       ├── EventRepository.java
    │       └── MembershipRepository.java
    └── resources/
        ├── static/          # Interfaz web (HTML, CSS, JS)
        └── application.properties

```

## Endpoints principales de la API

### Objetos Astronómicos (`/api/object`)

| Método | Endpoint | Descripción | 
| ----- | ----- | ----- | 
| `GET` | `/api/object` | Lista todos los objetos astronómicos | 
| `GET` | `/api/object/{id}` | Obtiene un objeto por su ID | 
| `POST` | `/api/object` | Crea un nuevo objeto astronómico (`201 Created` / `409 Conflict`) | 
| `PUT` | `/api/object/{id}` | Actualiza parcialmente un objeto existente | 
| `DELETE` | `/api/object/{id}` | Elimina un objeto por su ID (`204 No Content`) | 

### Eventos (`/api/event`)

| Método | Endpoint | Descripción | 
| ----- | ----- | ----- | 
| `GET` | `/api/event` | Lista todos los eventos | 
| `GET` | `/api/event/{id}` | Obtiene un evento por su ID | 
| `POST` | `/api/event` | Crea un evento asociado a un `creatorId` | 
| `POST` | `/api/event/publish` | Publica un evento autenticando credenciales de miembro (`identifier`, `password`) | 
| `GET` | `/api/event/member/published-events` | Lista los eventos creados por un miembro autenticado | 
| `PUT` | `/api/event/{id}` | Actualiza parcialmente un evento validando fechas y capacidad | 
| `DELETE` | `/api/event/{id}` | Elimina un evento por su ID | 

### Membresías (`/api/membership`)

| Método | Endpoint | Descripción | 
| ----- | ----- | ----- | 
| `GET` | `/api/membership` | Lista todas las membresías | 
| `GET` | `/api/membership/{id}` | Obtiene una membresía por su ID | 
| `POST` | `/api/membership` | Registra una membresía validando `idCard` y `email` únicos | 
| `PUT` | `/api/membership/{id}` | Actualiza parcialmente una membresía | 
| `DELETE` | `/api/membership/{id}` | Elimina una membresía por su ID | 

### Asistencias (`/api/attendance`)

| Método | Endpoint | Descripción | 
| ----- | ----- | ----- | 
| `GET` | `/api/attendance` | Lista todas las inscripciones | 
| `GET` | `/api/attendance/{id}` | Obtiene una inscripción por su ID | 
| `GET` | `/api/attendance/by-document/{idCard}` | Consulta asistencias por documento de identidad | 
| `GET` | `/api/attendance/member-profile` | Valida credenciales y retorna datos del miembro para precargar formulario | 
| `GET` | `/api/attendance/member/my-attendances` | Lista las asistencias de un miembro autenticado | 
| `POST` | `/api/attendance` | Registra una asistencia verificando cupo disponible del evento | 
| `PUT` | `/api/attendance/{id}` | Actualiza una asistencia recalculando aforo ocupado | 
| `PUT` | `/api/attendance/member/{attendanceId}` | Permite al miembro modificar cupos o cancelar su reserva | 
| `DELETE` | `/api/attendance/{id}` | Elimina un registro de asistencia | 

## Instalación y ejecución local

1. **Clonar el repositorio:**

   ```
   git clone <URL_DEL_REPOSITORIO>
   cd <NOMBRE_DEL_PROYECTO>
   
   ```

2. **Configurar la base de datos:**
   Edita `src/main/resources/application.properties` con tus credenciales de base de datos:

```
spring.application.name=work
spring.datasource.url=jdbc:mysql://localhost:3306/cielo_abierto_v2?createDatabaseIfNotExist=true&useSSL=false&serverTimezone=UTC
spring.datasource.username=IngresaTuUsuario
spring.datasource.password=IngresaTuContrasena
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
```

3. **Ejecutar la aplicación:**

   ```
   ./mvnw spring-boot:run
   
   ```

4. **Acceder a la aplicación:**
   Abre `http://localhost:8080` en tu navegador.

## Cargar la base de datos

1. Asegúrate de que tu servidor **MySQL** esté en ejecución.
2. Importa el archivo `data_base/seed.sql` para crear automáticamente la base de datos `cielo_abierto_v2`, sus tablas y los datos iniciales de prueba:

   - **Desde DBeaver o MySQL Workbench:**
     Abre el archivo `database/seed.sql` y ejecútalo como script SQL sobre tu conexión local.
