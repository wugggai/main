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
RUN rm -rf ./client/build

# Install Node.js dependencies for frontend
# Start frontend
WORKDIR /app/client
RUN yarn install && yarn build

# Install Python dependencies for backend
WORKDIR /app/server
RUN poetry config virtualenvs.create false \
  && poetry install --no-interaction --no-ansi

# Set work directory back to /app
WORKDIR /app
COPY . .

# Set up nginx proxy
# TODO: To scale, separate nginx and app components in separate containers
RUN apt-get install -y nginx
RUN apt-get install -y supervisor
COPY ./proxy/nginx.conf /etc/nginx/nginx.conf
COPY ./proxy/mime.types /etc/nginx/mime.types

COPY ./proxy/supervisord.conf /etc/supervisor/conf.d/supervisord.conf
CMD ["/usr/bin/supervisord"]
