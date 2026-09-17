@echo off
title goTrust Network Control Station
echo ==================================================
echo 🚀 INITIALIZING goTrust 1000-YEAR ENGINE CHANNELS
echo ==================================================
echo 🌐 Local Environment: Windows CMD
echo 📂 Root Path: %CD%
echo ==================================================

:: 1. Launch the Core Cryptographic Server in a fresh pane
echo 🟢 Firing up goTrust Core Node (Port 8085)...
start "goTrust Server Node" cmd /k "npx tsx server.ts"

:: 2. Wait 2 seconds to ensure the server pipe binds cleanly before listeners arrive
timeout /t 2 /nobreak > null

:: 3. Launch the Passive Broadcast Event Dashboard Monitor
echo 🟢 Linking Live Stream Dashboard...
start "goTrust Real-Time Dashboard" cmd /k "npx tsx dashboard.ts"

:: 4. Keep this main command orchestrator lane open for your custom transaction runs
echo 🟢 Preparing Transaction Input Shell...
echo ==================================================
echo 🎉 goTrust Network Protocol Engine is operational!
echo 💡 Run 'npx tsx client_test.ts' here to forge live logs.
echo ==================================================
cmd /k
