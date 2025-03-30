from sqlmodel import create_engine, Session

DATABASE_URL = "sqlite:///./app.db"

engine = create_engine(
    DATABASE_URL,
    echo=False,  # set True to see SQL logs
    connect_args={"check_same_thread": False},  # needed for SQLite + threads
)


def get_session():
    with Session(engine) as session:
        yield session
