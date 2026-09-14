from fastapi import FastAPI, APIRouter

app = FastAPI()

router = APIRouter(prefix="/test")

@router.get("")
def test():
    return {"ok": True}

print("ROUTER:", [(type(r).__name__, getattr(r, "path", None)) for r in router.routes])

app.include_router(router)

print("APP:", [(type(r).__name__, getattr(r, "path", None)) for r in app.routes])