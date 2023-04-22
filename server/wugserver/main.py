from fastapi import FastAPI
import uvicorn

from . import database
from .routers import users
from wugserver.database import engine

database.Base.metadata.create_all(bind=engine)


app = FastAPI()
app.router.prefix = "/api"

app.include_router(users.router)

def start():
    """Launched with `poetry run start` at root level"""
    uvicorn.run("wugserver.main:app",port=5000, reload=True)

@app.get("/time")
async def root():
    return {"message": "Hello World"}