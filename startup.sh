#!/bin/bash

echo "Starting setup"
cd scriptorium

echo "Installing npm dependencies..."
npm install

echo "Generating and running Prisma database"
npx prisma generate
npx prisma migrate dev

# Got this part from asking ChatGPT on how to create the images for docker
DOCKER_DIR="./docker"

for dockerfile in "$DOCKER_DIR"/Dockerfile.*; do
  filename=$(basename "$dockerfile")
  language="${filename#Dockerfile.}"

  IMAGE_NAME="sandbox-${language}"

  echo "Building Docker image for language: $language"

  docker build -f "$dockerfile" -t "$IMAGE_NAME" "$DOCKER_DIR"

  echo "Successfully built $IMAGE_NAME"
  echo "----------------------------------------"
done

echo "All Docker images have been built successfully."

echo "Creating database"

node databaseGeneration.ts
# NODE_EXIT_CODE=$?

# if [ $NODE_EXIT_CODE -eq 0 ]; then
#   echo "Admin user already exists."
# elif [ $NODE_EXIT_CODE -eq 1 ]; then
#   echo "Admin user was successfully created."
# elif [ $NODE_EXIT_CODE -eq 2 ]; then
#   echo "An error occurred while creating the admin user."
# fi
echo "Setup completed successfully."