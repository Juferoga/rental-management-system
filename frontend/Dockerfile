# Stage 1: Build the Angular application
FROM node:20-alpine AS build
WORKDIR /app

# Copy dependency definitions and install
COPY package*.json ./
RUN npm install

# Copy source code and build
COPY . .
RUN npm run build -- --configuration production

# Stage 2: Serve the application with Nginx
FROM nginx:alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy the build output from Stage 1 to Nginx's html folder.
# With @angular-devkit/build-angular:application, the output is in the 'browser' subfolder.
# To be safe against minor version differences, we copy everything from the build folder.
COPY --from=build /app/dist/primeng-quickstart/browser /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
