from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes.transaction_routes import api_router
from controllers.avatar_controller import router as avatar_router
from controllers.auth_controller import router as auth_router
from controllers.user_controller import router as user_router
from routes.realtime_routes import router as realtime_router
from config.database import Database

app = FastAPI(title="NeuroBank-Guardian API", version="0.1.0")

# CORS Configuration
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(api_router, prefix="/api/v1/transactions")
app.include_router(avatar_router, prefix="/api/v1/avatar")
app.include_router(realtime_router, prefix="/api/v1/realtime")
app.include_router(auth_router, prefix="/api/v1")
app.include_router(user_router, prefix="/api/v1")

@app.on_event("startup")
async def startup_event():
    Database.connect()

@app.on_event("shutdown")
async def shutdown_event():
    Database.close()

@app.get("/")
async def root():
    return {"message": "NeuroBank-Guardian API is running 🚀"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
