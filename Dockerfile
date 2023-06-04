# We'll use a multi-stage build process. First, we'll create a build image
FROM python:3.11-slim as build

# Install curl and Node.js for Yarn
RUN apt-get update && apt-get install -y curl && \
    curl -sL https://deb.nodesource.com/setup_14.x | bash - && \
    apt-get install -y nodejs

# Install Yarn
RUN npm install --global yarn

# Install Poetry
RUN pip install poetry

# Create directories for frontend and backend
WORKDIR /app
RUN mkdir client server

# Copy over the files needed for installation
COPY server ./server/
COPY client ./client/

# Install Node.js dependencies for frontend
WORKDIR /app/client
RUN yarn install

# Install Python dependencies for backend
WORKDIR /app/server
RUN poetry config virtualenvs.create false \
  && poetry install --no-interaction --no-ansi

# Set work directory back to /app
WORKDIR /app
COPY . .

# Build frontend as static file in backend
WORKDIR /app/client
RUN yarn install && npm run prod-build

# switch cwd to backend
WORKDIR /app/server

# The startup command that boots the backend
CMD ["sh", "-c", "poetry run start"]
