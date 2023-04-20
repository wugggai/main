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
poetry run flask run
```

Because Poetry defaults to run your python in a virtualenv, your text editor (VSCode) might not recognize it. Try this: https://stackoverflow.com/questions/59882884/vscode-doesnt-show-poetry-virtualenvs-in-select-interpreter-option
