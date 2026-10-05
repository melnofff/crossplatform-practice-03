@echo off
rem Run in an x64 Native Tools Command Prompt for Visual Studio.
cd /d "%~dp0"
if not exist out mkdir out
cl /nologo /O2 /MD hello.c /Foout\hello-md.obj /Feout\hello-md.exe
if errorlevel 1 exit /b 1
cl /nologo /O2 /MT hello.c /Foout\hello-mt.obj /Feout\hello-mt.exe
if errorlevel 1 exit /b 1
out\hello-md.exe
if errorlevel 1 exit /b 1
out\hello-mt.exe
if errorlevel 1 exit /b 1
dumpbin /dependents out\hello-md.exe > out\dependencies-md.txt
dumpbin /dependents out\hello-mt.exe > out\dependencies-mt.txt
