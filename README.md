 
## 🚀 Deploying to Railway

This project is set up for deployment to [Railway](https://railway.com) as two separate services:

### 1. Backend (FastAPI)
- Go to the `backend/` folder and create a new Railway service.
- Add the following as your start command (or use the included `Procfile`):
  ```
  uvicorn main:app --host 0.0.0.0 --port $PORT
  ```
- Ensure all dependencies are in `requirements.txt`.
- Railway will automatically use the `PORT` environment variable.

### 2. Frontend (Vite/React)
- Go to the `frontend/` folder and create a new Railway service.
- Railway will auto-detect the build and serve scripts from `package.json`.
- The static site will be served from the `dist/` directory after build.

### Notes
- You can connect both services to the same Railway project for easy management.
- Set up CORS in the backend (already enabled for all origins).
- For custom domains, use Railway’s dashboard after deployment. 