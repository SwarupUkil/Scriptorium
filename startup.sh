#!/bin/bash

echo "Starting setup"
cd scriptorium

echo "Installing npm dependencies..."
npm install

echo "Generating and running Prisma database"
npx prisma generate
npx prisma migrate dev

# Got this part from asking ChatGPT on how to check for compliers/interpreters
echo "Checking for required compilers/interpreters"
dependencies=(python3 node gcc g++ javac java)

for dep in "${dependencies[@]}"; do
  if ! command -v $dep &> /dev/null; then
    echo "$dep could not be found. Please install $dep."
    exit 1
  else
    echo "$dep is installed."
  fi
done

echo "All dependencies are installed."

echo "Creating admin user"

HASHED_PASSWORD='$2b$10$rvjRIs3NedTaz3bZBawHgeWuwb0Dr6cvckA3S0zACZl2Vr32ze/6y'
node -e "
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const existingUser = await prisma.user.findUnique({
      where: { username: 'admin' },
    });

    if (existingUser) {
      process.exit(0);
    } else {
      const user = await prisma.user.create({
        data: {
          username: 'admin',
          password: '$HASHED_PASSWORD',
          type: 'ADMIN',
          firstName: 'Admin',
          lastName: 'User',
          email: 'admin@example.com',
          pfpURL: null,
          phoneNumber: null,
          theme: 'LIGHT',
        },
      });
      process.exit(1);
    }
  } catch (error) {
    process.exit(2);
  }
}

main();
"
NODE_EXIT_CODE=$?

if [ $NODE_EXIT_CODE -eq 0 ]; then
  echo "Admin user already exists."
elif [ $NODE_EXIT_CODE -eq 1 ]; then
  echo "Admin user was successfully created."
elif [ $NODE_EXIT_CODE -eq 2 ]; then
  echo "An error occurred while creating the admin user."
fi
echo "Setup completed successfully."