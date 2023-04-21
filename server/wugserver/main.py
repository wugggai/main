from fastapi import FastAPI
import uvicorn

from .routers import users

app = FastAPI()
app.router.prefix = "/api"

app.include_router(users.router)

def start():
    """Launched with `poetry run start` at root level"""
    uvicorn.run("wugserver.main:app",port=5000, reload=True)

@app.get("/time")
async def root():
    return {"message": "Hello World"}