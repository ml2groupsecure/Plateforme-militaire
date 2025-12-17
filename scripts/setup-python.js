#!/usr/bin/env node

/**
 * Script de préparation automatique de l'environnement Python
 * S'exécute avant le démarrage de l'API pour s'assurer que tout est prêt
 */

import { exec, spawn } from 'child_process';
import { existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');
const pythonApiPath = join(projectRoot, 'python_api');
const venvPath = join(pythonApiPath, 'venv');

console.log('🔧 Préparation de l\'environnement Python pour l\'IA...');

function runCommand(command, cwd = process.cwd()) {
  return new Promise((resolve, reject) => {
    exec(command, { cwd }, (error, stdout, stderr) => {
      if (error) {
        reject(error);
        return;
      }
      resolve(stdout);
    });
  });
}

async function checkPython() {
  try {
    await runCommand('python --version');
    console.log('✅ Python détecté');
    return true;
  } catch (error) {
    console.log('❌ Python non trouvé dans le PATH');
    return false;
  }
}

async function setupPythonEnvironment() {
  try {
    // Vérifier si Python est disponible
    const hasPython = await checkPython();
    if (!hasPython) {
      console.log('⚠️  Python non détecté - Mode démonstration activé');
      return false;
    }

    // Vérifier/créer l'environnement virtuel
    if (!existsSync(venvPath)) {
      console.log('📦 Création de l\'environnement virtuel Python...');
      await runCommand('python -m venv venv', pythonApiPath);
      console.log('✅ Environnement virtuel créé');
    }

    // Vérifier si les dépendances sont installées
    const requirementsPath = join(pythonApiPath, 'requirements.txt');
    const pipFreezePath = join(venvPath, 'pip-freeze.txt');
    
    let needsInstall = false;
    
    if (!existsSync(pipFreezePath)) {
      needsInstall = true;
    } else {
      // Comparer les dates de modification
      const reqStats = require('fs').statSync(requirementsPath);
      const freezeStats = require('fs').statSync(pipFreezePath);
      if (reqStats.mtime > freezeStats.mtime) {
        needsInstall = true;
      }
    }

    if (needsInstall) {
      console.log('📥 Installation des dépendances Python...');
      const isWindows = process.platform === 'win32';
      const pipPath = isWindows 
        ? join(venvPath, 'Scripts', 'pip.exe')
        : join(venvPath, 'bin', 'pip');
      
      await runCommand(`"${pipPath}" install -r requirements.txt`, pythonApiPath);
      
      // Créer un fichier de marqueur
      await runCommand(`"${pipPath}" freeze > pip-freeze.txt`, pythonApiPath);
      console.log('✅ Dépendances installées');
    } else {
      console.log('✅ Dépendances Python déjà à jour');
    }

    return true;
  } catch (error) {
    console.log('❌ Erreur lors de la configuration Python:', error.message);
    return false;
  }
}

async function main() {
  const success = await setupPythonEnvironment();
  
  if (success) {
    console.log('🚀 Environnement Python prêt pour l\'IA !');
    process.exit(0);
  } else {
    console.log('⚠️  Environnement Python non disponible - Mode démonstration');
    process.exit(0); // Ne pas bloquer le démarrage
  }
}

main().catch(error => {
  console.error('💥 Erreur critique:', error);
  process.exit(1);
});