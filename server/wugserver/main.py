import logging
import os
from fastapi import Depends, FastAPI, Request
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from wugserver.routers import api_keys, authentication, interactions, messages, tags
from wugserver.models.user_authentication import get_current_active_user

from . import database
from .routers import users
from wugserver.database import engine
logging.basicConfig(level=logging.INFO)

database.Base.metadata.create_all(bind=engine)

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
app.include_router(api_keys.router, prefix=api_router_prefix, dependencies=[Depends(get_current_active_user)])
app.include_router(users.router, prefix=api_router_prefix)
app.include_router(interactions.router, prefix=api_router_prefix, dependencies=[Depends(get_current_active_user)])
app.include_router(messages.router, prefix=api_router_prefix, dependencies=[Depends(get_current_active_user)])
app.include_router(tags.router, prefix=api_router_prefix, dependencies=[Depends(get_current_active_user)])

def start():
    """Launched with `poetry run start` at root level"""
    uvicorn.run("wugserver.main:app", host="0.0.0.0", port=4000, reload=True, proxy_headers=True)
