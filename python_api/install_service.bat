@echo off
echo 🛠️  Installation de l'API comme service Windows...
echo.

REM Vérifier les privilèges administrateur
net session >nul 2>&1
if errorlevel 1 (
    echo ❌ Ce script nécessite les privilèges administrateur
    echo Clic droit -> Exécuter en tant qu'administrateur
    pause
    exit /b 1
)

echo 📦 Installation de NSSM (Non-Sucking Service Manager)...

REM Télécharger NSSM si nécessaire
if not exist "nssm.exe" (
    echo Téléchargez NSSM depuis https://nssm.cc/download
    echo Et placez nssm.exe dans ce dossier
    pause
    exit /b 1
)

REM Créer le service
echo 🔧 Création du service SeentuDash-API...

set SERVICE_NAME=SeentuDash-API
set PYTHON_PATH=%CD%\venv\Scripts\python.exe
set SCRIPT_PATH=%CD%\main.py

nssm install %SERVICE_NAME% "%PYTHON_PATH%" "%SCRIPT_PATH%"
nssm set %SERVICE_NAME% DisplayName "SeentuDash ML API"
nssm set %SERVICE_NAME% Description "API de prédiction ML pour SeentuDash"
nssm set %SERVICE_NAME% Start SERVICE_AUTO_START

echo ✅ Service installé avec succès !
echo.
echo 🚀 Pour démarrer le service:
echo    net start %SERVICE_NAME%
echo.
echo 🛑 Pour arrêter le service:
echo    net stop %SERVICE_NAME%
echo.
echo 🗑️  Pour désinstaller le service:
echo    nssm remove %SERVICE_NAME% confirm
echo.

pause