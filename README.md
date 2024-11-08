# main


## Client Init:
Install Node (18.16.0): https://nodejs.org/en  
Install Yarn: https://classic.yarnpkg.com/en/docs/install (frontend package management)
```
cd client
yarn install
yarn start
```

## Server Init:
Install Python(3.11.2): https://www.python.org/downloads/release/python-3112/  
Install Poetry: https://python-poetry.org/docs/#installation
```
cd server
poetry install
poetry run start
```

Note:
Set SENDGRID_API_KEY as environment variable.
localhost:4000/docs you can play with the endpoints.

Because Poetry defaults to run your python in a virtualenv, your text editor (VSCode) might not recognize it.
Try this: https://stackoverflow.com/questions/59882884/vscode-doesnt-show-poetry-virtualenvs-in-select-interpreter-option


## Test Local Deployment:
Install Docker(23.0.5+): https://docs.docker.com/get-docker/. Start the docker daemon by opening Docker Desktop
Install azure CLI: https://learn.microsoft.com/en-us/cli/azure/install-azure-cli

In the root directory:
```
az login

docker build -t wug-base-image .

# Test locally before pushing
docker run -p 5000:5000 wug-base-image
```

## Deploy to staging

Simply `git push` to staging branch
Or, do it manually:

```
docker tag wug-base-image wugdockers.azurecr.io/wug-base-image:latest
docker push wugdockers.azurecr.io/wug-base-image:latest
```

View deployment and application logs:
```
az webapp log tail --name wug-staging --resource-group wug-staging
```
