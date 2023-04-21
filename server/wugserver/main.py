from fastapi import FastAPI
import uvicorn

app = FastAPI()

def start():
    """Launched with `poetry run start` at root level"""
    uvicorn.run("wugserver.main:app",port=5000, reload=True)

@app.get("/")
async def root():
    return {"message": "Hello World"}