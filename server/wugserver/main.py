import logging
import os
from fastapi import FastAPI, Request
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from fastapi.middleware.cors import CORSMiddleware
import openai
import uvicorn
from wugserver.routers import authentication, interactions, messages, tags

from . import database
from .routers import users
from wugserver.database import engine
from dotenv import load_dotenv
logging.basicConfig(level=logging.INFO)

database.Base.metadata.create_all(bind=engine)
load_dotenv() # Load local .env file
openai.api_key = os.environ.get('OPENAI_API_KEY') #put the api key here
if openai.api_key:
    print("Loaded API key from local environment")

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

api_router_prefix = "/api"

app.include_router(authentication.router, prefix=api_router_prefix)
app.include_router(users.router, prefix=api_router_prefix)
app.include_router(interactions.router, prefix=api_router_prefix)
app.include_router(messages.router, prefix=api_router_prefix)
app.include_router(tags.router, prefix=api_router_prefix)


build_dir = os.path.dirname(os.path.realpath(__file__)) + "/build"

templates = Jinja2Templates(directory=build_dir)

"""
Mounts the `build` folder to the `/app` route.
That is because the react app uses `app` as homepage.
"""
app.mount('/app', StaticFiles(directory=build_dir), 'build')
app.mount('/assets', StaticFiles(directory=build_dir+"/assets"), 'assets')


# sets up a health check route. This is used later to show how you can hit
# the API and the React App url's
@app.get('/api/health')
async def health():
    return { 'status': 'healthy' }


# Defines a route handler for `/*` essentially.
# NOTE: this needs to be the last route defined b/c it's a catch all route
@app.get("/")
async def react_app(req: Request):
    return templates.TemplateResponse('index.html', { 'request': req })


def start():
    """Launched with `poetry run start` at root level"""
    uvicorn.run("wugserver.main:app", host="0.0.0.0", port=5000, reload=True, proxy_headers=True)