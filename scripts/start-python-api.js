#!/usr/bin/env node

/**
 * Script pour démarrer automatiquement l'API Python avec le modèle IA
 * Gère la création de l'environnement virtuel et l'installation des dépendances
 */

import { spawn, exec } from 'child_process';
import { existsSync, mkdirSync, readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

function loadDotEnvFile(filePath) {
  if (!existsSync(filePath)) return;
  try {
    const raw = readFileSync(filePath, 'utf8');
    for (const line of raw.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const idx = trimmed.indexOf('=');
      if (idx === -1) continue;
      const key = trimmed.slice(0, idx).trim();
      let value = trimmed.slice(idx + 1).trim();
      // strip quotes
      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      if (key && process.env[key] === undefined) {
        process.env[key] = value;
      }
    }
    console.log(`✅ Env Python chargé: ${filePath}`);
  } catch (e) {
    console.log(`⚠️  Impossible de lire ${filePath}: ${e.message}`);
  }
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');
const pythonApiPath = join(projectRoot, 'python_api');

// Charger la config Python depuis un fichier séparé (python_api/.env)
// IMPORTANT: ce fichier peut contenir GROQ_API_KEY etc.
loadDotEnvFile(join(pythonApiPath, '.env'));

// On utilise un venv dédié au Radar Sénégal (évite les conflits de dépendances)
// Vous pouvez surcharger via PYTHON_VENV_NAME dans python_api/.env
const venvName = process.env.PYTHON_VENV_NAME || 'venv_radar';
const venvPath = join(pythonApiPath, venvName);
const modelPath = join(pythonApiPath, 'best_recidivism_model.joblib');

console.log('🤖 Démarrage de l\'API Python avec IA...');

function runCommand(command, cwd = process.cwd()) {
  return new Promise((resolve, reject) => {
    exec(command, { cwd, shell: true }, (error, stdout, stderr) => {
      if (error) {
        reject(new Error(`${error.message}\n${stderr}`));
        return;
      }
      resolve(stdout);
    });
  });
}

async function checkPython() {
  try {
    const result = await runCommand('python --version');
    console.log('✅ Python détecté:', result.trim());
    return true;
  } catch (error) {
    console.log('❌ Python non trouvé');
    return false;
  }
}

async function setupPythonEnvironment() {
  try {
    // Vérifier Python
    const hasPython = await checkPython();
    if (!hasPython) {
      throw new Error('Python non disponible');
    }

    // Vérifier le modèle (optionnel)
    // IMPORTANT: le Radar IA (Folium) ne dépend pas du modèle ML.
    if (!existsSync(modelPath)) {
      console.log('⚠️  Modèle IA non trouvé (best_recidivism_model.joblib). Démarrage en mode démonstration.');
    } else {
      console.log('✅ Modèle IA trouvé');
    }

    // Créer l'environnement virtuel si nécessaire
    // IMPORTANT (Windows): préférer Python 3.12 si dispo, car beaucoup de libs ML (scikit-learn, numpy)
    // ne sont pas toujours prêtes pour Python 3.13.
    if (!existsSync(venvPath)) {
      console.log('📦 Création de l\'environnement virtuel...');

      const preferredPy = process.env.PYTHON_VERSION ? `py -${process.env.PYTHON_VERSION}` : 'py -3.12';
      let venvCreateCmd = `python -m venv ${venvName}`;
      try {
        await runCommand(`${preferredPy} --version`, pythonApiPath);
        venvCreateCmd = `${preferredPy} -m venv ${venvName}`;
      } catch {
        // fallback sur python par défaut
      }

      await runCommand(venvCreateCmd, pythonApiPath);
      console.log('✅ Environnement virtuel créé');
    }

    // Déterminer le chemin Python et pip selon l'OS
    const isWindows = process.platform === 'win32';
    let pythonExe = isWindows 
      ? join(venvPath, 'Scripts', 'python.exe')
      : join(venvPath, 'bin', 'python');
    let pipExe = isWindows 
      ? join(venvPath, 'Scripts', 'pip.exe')
      : join(venvPath, 'bin', 'pip');

    // Vérifier que le venv n'est pas cassé (cas fréquent: base Python déplacée/supprimée)
    try {
      await runCommand(`\"${pythonExe}\" --version`, pythonApiPath);
    } catch (venvError) {
      console.log('⚠️  Environnement virtuel détecté mais invalide. Recréation...');

      try {
        const { renameSync } = await import('fs');
        const ts = new Date().toISOString().replace(/[:.]/g, '-');
        const brokenPath = join(pythonApiPath, `${venvName}_broken_${ts}`);
        renameSync(venvPath, brokenPath);
        console.log(`🧹 Ancien venv déplacé vers: ${brokenPath}`);
      } catch {
        // Si le rename échoue, on continue quand même et on tente une recréation par-dessus.
      }

      const preferredPy = process.env.PYTHON_VERSION ? `py -${process.env.PYTHON_VERSION}` : 'py -3.12';
      let venvCreateCmd = `python -m venv ${venvName}`;
      try {
        await runCommand(`${preferredPy} --version`, pythonApiPath);
        venvCreateCmd = `${preferredPy} -m venv ${venvName}`;
      } catch {
        // fallback
      }

      await runCommand(venvCreateCmd, pythonApiPath);
      console.log('✅ Environnement virtuel recréé');

      // Recalculer les chemins
      pythonExe = isWindows 
        ? join(venvPath, 'Scripts', 'python.exe')
        : join(venvPath, 'bin', 'python');
      pipExe = isWindows 
        ? join(venvPath, 'Scripts', 'pip.exe')
        : join(venvPath, 'bin', 'pip');
    }

    // Installer les dépendances si nécessaire
    const requirementsPath = join(pythonApiPath, 'requirements.txt');
    if (existsSync(requirementsPath)) {
      console.log('📥 Vérification des dépendances...');
      
      try {
        // Essayer d'importer les deps principales pour vérifier si elles sont installées
        await runCommand(
          `\"${pythonExe}\" -c \"import fastapi; import joblib; import uvicorn; import requests; import feedparser; import bs4; import folium; import langchain_groq; import langchain_core\"`,
          pythonApiPath
        );
        console.log('✅ Dépendances déjà installées');
      } catch (importError) {
        console.log('📦 Installation des dépendances Python...');
        await runCommand(`"${pipExe}" install -r requirements.txt`, pythonApiPath);
        console.log('✅ Dépendances installées');
      }
    }

    return { pythonExe, success: true };
  } catch (error) {
    console.log('⚠️  Erreur Python:', error.message);
    return { success: false, error: error.message };
  }
}

async function startPythonAPI() {
  try {
    const setup = await setupPythonEnvironment();
    
    if (!setup.success) {
      console.log('🎪 Mode démonstration activé (API Python non disponible)');
      console.log('   L\'application utilisera des prédictions simulées.');
      
      // Créer un serveur mock simple pour éviter les erreurs de connexion
      // (on met aussi CORS pour éviter "Failed to fetch" côté navigateur)
      const http = await import('http');
      const server = http.createServer((req, res) => {
        res.writeHead(404, {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
          'Access-Control-Allow-Headers': '*',
        });
        res.end(JSON.stringify({ error: 'API Python non disponible - Mode démonstration' }));
      });
      
      server.listen(8000, () => {
        console.log('🎭 Serveur mock démarré sur le port 8000');
      });
      
      return;
    }

    console.log('🚀 Démarrage de l\'API Python avec votre modèle IA...');
    
    const isWindows = process.platform === 'win32';
    const pythonExe = setup.pythonExe;
    const mainScript = join(pythonApiPath, 'main.py');
    
    // Lancer l'API Python avec gestion correcte des espaces dans les chemins
    const pythonProcess = spawn(pythonExe, [mainScript], {
      cwd: pythonApiPath,
      stdio: ['ignore', 'pipe', 'pipe'],
      shell: false,
      windowsHide: true,
      env: {
        ...process.env,
        // Eviter les crash Unicode sur Windows
        PYTHONUTF8: process.env.PYTHONUTF8 || '1',
        PYTHONIOENCODING: process.env.PYTHONIOENCODING || 'utf-8',
        // fallback si non définis dans python_api/.env
        PYTHON_API_HOST: process.env.PYTHON_API_HOST || '0.0.0.0',
        PYTHON_API_PORT: process.env.PYTHON_API_PORT || '8000',
      },
    });

    pythonProcess.stdout.on('data', (data) => {
      const message = data.toString().trim();
      if (message) {
        console.log(`🐍 ${message}`);
      }
    });

    pythonProcess.stderr.on('data', (data) => {
      const message = data.toString().trim();
      if (message && !message.includes('WARNING')) {
        console.log(`🐍 ⚠️  ${message}`);
      }
    });

    pythonProcess.on('error', (error) => {
      console.log('❌ Erreur API Python:', error.message);
    });

    pythonProcess.on('exit', (code) => {
      if (code !== 0) {
        console.log(`🐍 API Python fermée avec le code ${code}`);
      }
    });

    // Gérer l'arrêt propre
    process.on('SIGINT', () => {
      console.log('🛑 Arrêt de l\'API Python...');
      pythonProcess.kill('SIGINT');
      process.exit(0);
    });

    process.on('SIGTERM', () => {
      pythonProcess.kill('SIGTERM');
      process.exit(0);
    });

    console.log('✅ API Python avec IA démarrée !');
    console.log('📍 Endpoint: http://localhost:8000');
    console.log('📊 Documentation: http://localhost:8000/docs');

  } catch (error) {
    console.log('💥 Erreur fatale:', error.message);
    process.exit(1);
  }
}

// Démarrer l'API
startPythonAPI();