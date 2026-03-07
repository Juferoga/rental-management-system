# ==============================================================================
# ETAPA 1: CONSTRUCCIÓN
# ==============================================================================
FROM maven:3.9.9-eclipse-temurin-21 AS builder

WORKDIR /app

# 1. Copiamos el pom.xml y descargamos dependencias (Aprovecha la caché de Docker)
COPY pom.xml .
RUN mvn dependency:go-offline

# 2. Copiamos el código fuente y compilamos
COPY src ./src
RUN mvn clean package -DskipTests

# ==============================================================================
# ETAPA 2: EJECUCIÓN
# ==============================================================================
FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

# 3. Extraemos SOLO los binarios generados por Quarkus de la etapa anterior
# Quarkus genera un "fast-jar" estructurado en la carpeta target/quarkus-app/
COPY --from=builder /app/target/quarkus-app/lib/ /app/lib/
COPY --from=builder /app/target/quarkus-app/*.jar /app/
COPY --from=builder /app/target/quarkus-app/app/ /app/app/
COPY --from=builder /app/target/quarkus-app/quarkus/ /app/quarkus/

# Damos permisos de ejecución por si acaso
RUN chmod 775 /app

EXPOSE 8080

# Comando de arranque hiper-optimizado
CMD ["java", "-jar", "/app/quarkus-run.jar"]