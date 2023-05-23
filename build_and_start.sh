#!/bin/bash

# Start the backend server in the background
cd server
poetry install
poetry run start &

echo "Backend PID: $!"
cd ..

# Start the frontend server
cd client
yarn install
yarn start
