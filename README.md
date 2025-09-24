# CI/CD Pipeline con Node.js, Docker y AWS

Este proyecto implementa un sistema de CI/CD completo utilizando Node.js, Docker, GitHub Actions y AWS para automatizar el proceso de integración y despliegue continuo.

## Descripción

Este proyecto consiste en una API RESTful desarrollada en Node.js que gestiona usuarios, con un sistema completo de CI/CD que automatiza:

- Ejecución de pruebas unitarias
- Construcción de imágenes Docker
- Publicación en Amazon ECR
- Despliegue automático en EC2
- Ejecución de migraciones de base de datos MySQL

## Tecnologías Utilizadas

### Backend
- **Node.js 18**: Runtime de JavaScript
- **Express.js**: Framework web
- **MySQL 8.0**: Base de datos relacional
- **Docker**: Containerización

### DevOps & CI/CD
- **GitHub Actions**: Pipeline de CI/CD
- **Amazon ECR**: Registro de contenedores
- **Amazon EC2**: Servidor de aplicaciones
- **Amazon RDS**: Base de datos en la nube (opcional)

### Testing & Quality
- **Jest**: Framework de testing
- **Supertest**: Testing de APIs

## Configuración del Proyecto

### Prerrequisitos

```bash
- Node.js 18+
- Docker & Docker Compose
- Git
- Cuenta AWS con permisos para ECR y EC2
- MySQL 8.0 (local o RDS)
```

### Instalación Local

```bash
# Clonar el repositorio
git clone <repository-url>
cd cicd-nodejs-aws

# Instalar dependencias
npm install

# Configurar variables de entorno
# Editar .env con tus configuraciones

# Ejecutar migraciones
npm run migrate

# Iniciar en modo desarrollo
npm run dev
```

### Configuración con Docker

```bash
# Levantar toda la infraestructura
docker-compose up -d

# Ver logs
docker-compose logs -f app

# Ejecutar migraciones en Docker
docker-compose exec app npm run migrate
```

## Pipeline de CI/CD

### Descripción del Pipeline

El pipeline se ejecuta automáticamente cuando se realizan cambios en la rama `develop` y consta de las siguientes etapas:

#### 1. Testing Stage
- Checkout del código fuente
- Configuración de Node.js 18
- Instalación de dependencias
- Levantamiento de MySQL como servicio
- Ejecución de migraciones de BD
- Ejecución de pruebas unitarias y de integración

#### 2. Build & Deploy Stage
- Construcción de imagen Docker
- Login en Amazon ECR
- Etiquetado con SHA del commit + latest
- Push de imagen a ECR
- Despliegue en instancia EC2
- Ejecución de migraciones en producción
- Verificación de salud de la aplicación

### Configuración de Secretos en GitHub

Para que el pipeline funcione correctamente, necesitas configurar los siguientes secretos en GitHub:

```
AWS_ACCESS_KEY_ID: Clave de acceso AWS
AWS_SECRET_ACCESS_KEY: Clave secreta AWS
EC2_SSH_KEY: Clave privada SSH para EC2
EC2_HOST: IP pública de la instancia EC2
EC2_USER: Usuario SSH (ubuntu/ec2-user)
DB_HOST: Host de la base de datos
DB_PORT: Puerto de la base de datos (3306)
DB_NAME: Nombre de la base de datos
DB_USER: Usuario de la base de datos
DB_PASSWORD: Contraseña de la base de datos
```

## Manejo de Migraciones

### Sistema de Migraciones

El proyecto incluye un sistema robusto de migraciones que garantiza:

- **Tracking de migraciones**: Tabla `migrations` para control de versiones
- **Transacciones**: Cada migración se ejecuta en una transacción
- **Rollback automático**: En caso de error, se revierten los cambios
- **Idempotencia**: Las migraciones se pueden ejecutar múltiples veces

### Estructura de Migraciones

```sql
-- migrations/001_create_users_table.sql
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### Ejecución de Migraciones

```bash
# Localmente
npm run migrate

# En Docker
docker-compose exec app npm run migrate

# En el pipeline (automático)
# Se ejecutan durante el despliegue
```

## API Endpoints

### Usuarios

- `GET /api/users` - Obtener todos los usuarios
- `GET /api/users/:id` - Obtener usuario por ID
- `POST /api/users` - Crear nuevo usuario
- `PUT /api/users/:id` - Actualizar usuario
- `DELETE /api/users/:id` - Eliminar usuario

### Health Check

- `GET /health` - Verificar estado de la aplicación

### Ejemplos de Uso

#### Crear Usuario
```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"name": "John Doe", "email": "john@example.com"}'
```

#### Obtener Usuarios
```bash
curl -X GET http://localhost:3000/api/users
```

#### Actualizar Usuario
```bash
curl -X PUT http://localhost:3000/api/users/1 \
  -H "Content-Type: application/json" \
  -d '{"name": "Jane Doe", "email": "jane@example.com"}'
```

## Despliegue en AWS

### Arquitectura AWS

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Amazon ECR    │    │   Amazon EC2     │    │  Amazon RDS     │
│                 │    │                  │    │                 │
│ Docker Registry │    │ Application      │────│ MySQL Database │
│                 │    │ Server           │    │                 │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

### Configuración de EC2

1. **Instancia EC2**:
   - AMI: Amazon Linux 2023
   - Tipo: t3.micro (elegible para free tier)
   - Security Group: Puerto 22 (SSH), 3000 (API), 80 (HTTP)

2. **Instalación en EC2**:
```bash
# Conectar vía SSH
ssh -i "your-key.pem" ec2-user@your-ec2-ip

# Instalar Docker
sudo yum update -y
sudo yum install -y docker
sudo service docker start
sudo usermod -a -G docker ec2-user

# Instalar AWS CLI
sudo yum install -y aws-cli
```

3. **Configuración de ECR**:
```bash
# Crear repositorio
aws ecr create-repository --repository-name cicd-nodejs-app --region us-east-1

# Obtener URI del repositorio
aws ecr describe-repositories --repository-names cicd-nodejs-app
```

## Evidencias del Despliegue

### Capturas de Pantalla Esperadas

1. **GitHub Actions Pipeline**
   - Estado exitoso del workflow
   - Tiempo de ejecución de cada job
   - Logs detallados de cada step

2. **Amazon ECR**
   - Imágenes Docker almacenadas
   - Tags por commit SHA
   - Historial de pushes

3. **Amazon EC2**
   - Instancia ejecutándose
   - Contenedores activos
   - Métricas de CPU/Memoria

4. **Base de Datos MySQL**
   - Tablas creadas correctamente
   - Registro de migraciones ejecutadas
   - Datos de ejemplo insertados

### Logs del Sistema

```bash
# Logs de la aplicación
docker logs cicd-app

# Logs del sistema
journalctl -u docker.service

# Logs de migraciones
npm run migrate
```

### Health Checks

```bash
# Verificar salud de la API
curl -X GET http://your-ec2-ip:3000/health

# Respuesta esperada
{
  "status": "OK",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "version": "1.0.0"
}
```

## Pruebas

### Tipos de Pruebas Implementadas

1. **Unit Tests**: Pruebas de componentes individuales
2. **Integration Tests**: Pruebas de endpoints de API
3. **Health Check Tests**: Verificación de servicios

### Ejecución de Pruebas

```bash
# Todas las pruebas
npm test

# Pruebas con cobertura
npm test -- --coverage

# Pruebas en modo watch
npm test -- --watch
```

### Cobertura Esperada

- Controladores: >90%
- Modelos: >85%
- Rutas: >95%
- Middlewares: >80%

## Configuración de Ramas y Pull Requests

### Branch Protection Rules

Para configurar la protección de la rama `develop`:

1. Ir a Settings > Branches en GitHub
2. Add rule
3. Branch name pattern: `develop`
4. Marcar las siguientes opciones:
   - Require pull request reviews before merging
   - Require status checks to pass before merging
   - Require branches to be up to date before merging
   - Include administrators

### Workflow de Desarrollo

1. Crear feature branch desde `develop`
2. Realizar cambios y commits
3. Crear Pull Request hacia `develop`
4. Revisión de código
5. Merge automático después de aprobación y CI exitoso

## Monitoreo y Logs

### Endpoints de Monitoreo

- `GET /health`: Estado general de la aplicación

### Logging

- **Morgan**: Logs de requests HTTP
- **Console**: Logs de desarrollo y errores

### Métricas

El sistema registra:
- Tiempo de respuesta de endpoints
- Errores de base de datos
- Estado de conexiones

## Solución de Problemas

### Problemas Comunes

1. **Error de conexión a MySQL**
   ```bash
   # Verificar conectividad
   docker-compose exec app npm run migrate
   ```

2. **Fallo en el pipeline**
   ```bash
   # Verificar secretos de GitHub
   # Revisar logs de GitHub Actions
   ```

3. **Error de permisos en EC2**
   ```bash
   # Verificar IAM roles
   # Comprobar security groups
   ```

4. **Error de migración**
   ```bash
   # Verificar conexión a base de datos
   # Revisar sintaxis SQL en archivos de migración
   ```

## Comandos Útiles

### Desarrollo Local

```bash
# Iniciar MySQL local
docker run --name mysql-local \
  -e MYSQL_ROOT_PASSWORD=password \
  -e MYSQL_DATABASE=cicd_app \
  -p 3306:3306 \
  -d mysql:8.0

# Conectar a MySQL
mysql -h localhost -u root -ppassword cicd_app

# Ver tablas
SHOW TABLES;

# Ver usuarios
SELECT * FROM users;
```

### Docker

```bash
# Construir imagen
docker build -t cicd-nodejs-app:latest .

# Ejecutar contenedor
docker run -d \
  --name cicd-app-local \
  -p 3000:3000 \
  -e DB_HOST=host.docker.internal \
  -e DB_PORT=3306 \
  -e DB_NAME=cicd_app \
  -e DB_USER=root \
  -e DB_PASSWORD=password \
  cicd-nodejs-app:latest

# Limpiar contenedores
docker system prune -af
```

## Conclusiones

### Beneficios del CI/CD con Contenedores y Nube

1. **Automatización Completa**
   - Eliminación de despliegues manuales
   - Reducción de errores humanos
   - Consistencia entre entornos

2. **Escalabilidad**
   - Fácil escalamiento horizontal con Docker
   - Aprovechamiento de servicios AWS
   - Gestión eficiente de recursos

3. **Confiabilidad**
   - Pruebas automáticas antes del despliegue
   - Rollback automático en caso de fallas
   - Monitoreo continuo de la aplicación

4. **Eficiencia Operacional**
   - Despliegues rápidos y frecuentes
   - Menor tiempo de inactividad
   - Mejor colaboración en equipo

### Mejoras Futuras

- Implementar autenticación y autorización
- Agregar métricas avanzadas con CloudWatch
- Migrar a ECS/Fargate para mayor escalabilidad
- Implementar SSL/TLS con Certificate Manager
- Crear frontend para interactuar con la API
- Agregar cache con Redis
- Implementar rate limiting
- Configurar alertas y notificaciones

### Lecciones Aprendidas

1. **Docker**: La containerización simplifica significativamente el despliegue y garantiza consistencia entre entornos
2. **GitHub Actions**: Proporciona un pipeline robusto y flexible con integración nativa a servicios de AWS
3. **AWS**: Los servicios cloud facilitan la escalabilidad y mantenimiento, pero requieren configuración cuidadosa de permisos
4. **MySQL**: Un sistema de migraciones sólido es crucial para mantener la integridad de la base de datos
5. **Monitoreo**: Los health checks son esenciales para detectar problemas tempranamente
6. **Testing**: Las pruebas automatizadas previenen regresiones y mejoran la confianza en los despliegues

### Consideraciones de Seguridad

- Todas las credenciales se manejan como secretos
- Contenedores ejecutan con usuarios no-root
- Base de datos protegida por autenticación
- Comunicación entre servicios en red privada
- Logs no exponen información sensible

---

## Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.
