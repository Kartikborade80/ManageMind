@echo off
git init
git add .
git commit -m "Initial commit for ManageMind Diploma Platform including FastAPI backend and React frontend."
git branch -M main
git remote add origin https://github.com/Kartikborade80/ManageMind-diploma-platform.git
git push -u origin main
echo Done.
pause
