import os
from sqlalchemy import create_engine, event
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

from wugserver.constants import ENV, Environment


# NOTE: DO NOT using STAGING db for dev testing unless absolutely necessary
#       PRODUCTION db will not be accessible from dev
mysql_db_conn = os.environ.get("MYSQL_DB_CONN")

def create_azure_mysql_engine():
    return create_engine(mysql_db_conn)


def create_sqlite_engine():
    SQLALCHEMY_DATABASE_URL = "sqlite:///./sql_app.db"

    engine = create_engine(
        SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
    )

    def _fk_pragma_on_connect(dbapi_con, con_record):
        dbapi_con.execute("pragma foreign_keys=ON")

    event.listen(engine, "connect", _fk_pragma_on_connect)
    return engine


if mysql_db_conn:
    engine = create_azure_mysql_engine()
else:
    engine = create_sqlite_engine()

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()
Base.metadata.create_all(engine)
