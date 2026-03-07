# Usamos Node 22 como pide la documentación
FROM node:22-bookworm

# Evitamos prompts interactivos durante la instalación
ENV DEBIAN_FRONTEND=noninteractive

# Definimos el directorio de trabajo y variables de entorno de OpenClaw
WORKDIR /app
ENV OPENCLAW_HOME=/app/data

# Instalamos dependencias básicas y OpenClaw usando el script oficial
RUN apt-get update && apt-get install -y curl bash jq && \
    curl -fsSL https://openclaw.ai/install.sh | bash

# Exponemos el puerto del Gateway (18789) y el Control UI
EXPOSE 18789

# Arrancamos el Gateway en primer plano para que el contenedor no muera
CMD ["openclaw", "gateway", "--port", "18789"]