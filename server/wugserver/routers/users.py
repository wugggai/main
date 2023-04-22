from fastapi import APIRouter, Depends, HTTPException
from wugserver.database import SessionLocal
from wugserver.dependencies import get_db
from wugserver.schema.user import *
from wugserver.models.user import *

router = APIRouter()

@router.post("/users/", response_model=User)
def create_user(user: UserCreate, db: Session = Depends(get_db)):
    print(user)
    db_user = getUserByEmail(db, email=user.email)
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    return createUser(db=db, user=user)

@router.get("/users/", response_model=list[User])
def read_users(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    users = getUsers(db, skip=skip, limit=limit)
    return users