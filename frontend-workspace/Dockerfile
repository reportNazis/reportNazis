# Stage 1: Build
FROM node:20-alpine as builder

WORKDIR /app
COPY frontend-workspace /app

# Clean install
RUN npm ci

# Build both apps explicitly
# We use npx ng build to ensure we use the local angular cli
RUN npx ng build frontend-user --configuration production
RUN npx ng build frontend-admin --configuration production

# This Dockerfile is used to build the image with artifacts in /app/dist
CMD ["true"]
