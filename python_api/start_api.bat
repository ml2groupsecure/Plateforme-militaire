@echo off
echo 🚀 Démarrage de l'API de prédiction ML...
echo.

REM Vérifier si Python est installé
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python n'est pas installé ou pas dans le PATH
    echo Installez Python depuis https://python.org/downloads/
    pause
    exit /b 1
)

REM Installer les dépendances si nécessaire
REM On utilise un venv dédié au Radar Sénégal pour éviter les conflits.
set VENV_DIR=venv_radar

if not exist "%VENV_DIR%" (
    echo 📦 Création de l'environnement virtuel (%VENV_DIR%)...
    python -m venv %VENV_DIR%
)

echo 🔧 Activation de l'environnement virtuel...
call %VENV_DIR%\Scripts\activate.bat

echo 📥 Installation des dépendances...
pip install -r requirements.txt

echo 🤖 Démarrage de l'API FastAPI...
echo 📍 API disponible sur: http://localhost:8000
echo 📊 Documentation: http://localhost:8000/docs
echo.
echo Appuyez sur Ctrl+C pour arrêter l'API
echo.

python main.py