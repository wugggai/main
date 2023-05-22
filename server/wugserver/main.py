import logging
import os
from fastapi import FastAPI
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

app.router.prefix = "/api"

app.include_router(authentication.router)
app.include_router(users.router)
app.include_router(interactions.router)
app.include_router(messages.router)
app.include_router(tags.router)

def start():
    """Launched with `poetry run start` at root level"""
    uvicorn.run("wugserver.main:app",port=5000, reload=True)

@app.get("/time")
async def root():
    return {"message": "Hello World"}
