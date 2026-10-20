# 1. Etapa de compilación instalando Maven directamente
FROM eclipse-temurin:17-jdk-alpine AS build
WORKDIR /app

# Instalar maven en Alpine
RUN apk add --no-cache maven

# Copiar todo el código fuente
COPY . .

# Compilar usando el maven instalado del sistema
RUN mvn clean package -DskipTests

# 2. Etapa de ejecución ligera
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
