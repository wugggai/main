import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import openai
import uvicorn

from wugserver.routers import interactions, messages

from . import database
from .routers import users
from wugserver.database import engine

database.Base.metadata.create_all(bind=engine)
openai.api_key = "" #put the api key here


app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.router.prefix = "/api"

app.include_router(users.router)
app.include_router(interactions.router)
app.include_router(messages.router)

def start():
    """Launched with `poetry run start` at root level"""
    uvicorn.run("wugserver.main:app",port=5000, reload=True)

@app.get("/time")
async def root():
    return {"message": "Hello World"}