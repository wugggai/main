from typing import Annotated
from fastapi import APIRouter, Depends

from wugserver.models.users.GetUserModel import GetUserModel


router = APIRouter()

@router.get("/users/")
async def read_users(getUserModel: Annotated[GetUserModel, Depends()]):
    return getUserModel.getUserWithId()
