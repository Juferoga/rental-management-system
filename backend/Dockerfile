# ==============================================================================
# ETAPA 1: CONSTRUCCIÓN (misma imagen base que usa Quarkus para builder)
# ==============================================================================
FROM registry.access.redhat.com/ubi9/openjdk-21:1.20 AS builder

USER root
WORKDIR /build

COPY pom.xml .
RUN mvn -B dependency:go-offline

COPY src ./src
RUN mvn -B clean package -DskipTests

# ==============================================================================
# ETAPA 2: EJECUCIÓN (idéntico al Dockerfile.jvm que genera Quarkus)
# ==============================================================================
FROM registry.access.redhat.com/ubi9/openjdk-21-runtime:1.24

ENV LANGUAGE='en_US:en'

COPY --chown=185 --from=builder /build/target/quarkus-app/lib/ /deployments/lib/
COPY --chown=185 --from=builder /build/target/quarkus-app/*.jar /deployments/
COPY --chown=185 --from=builder /build/target/quarkus-app/app/ /deployments/app/
COPY --chown=185 --from=builder /build/target/quarkus-app/quarkus/ /deployments/quarkus/

EXPOSE 8080
USER 185
ENV JAVA_OPTS_APPEND="-Dquarkus.http.host=0.0.0.0 -Djava.util.logging.manager=org.jboss.logmanager.LogManager"
ENV JAVA_APP_JAR="/deployments/quarkus-run.jar"

ENTRYPOINT [ "/opt/jboss/container/java/run/run-java.sh" ]
