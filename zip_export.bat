@echo off
setlocal EnableExtensions

rem Export the repository folder containing this batch file.
pushd "%~dp0"
if errorlevel 1 (
    echo ERROR: Cannot open the project folder.
    pause
    exit /b 1
)

where git >nul 2>&1
if errorlevel 1 (
    echo ERROR: Git is not available in PATH.
    goto :fail
)

if not exist "%SystemRoot%\System32\tar.exe" (
    echo ERROR: Windows tar.exe was not found.
    goto :fail
)

git rev-parse --is-inside-work-tree >nul 2>&1
if errorlevel 1 (
    echo ERROR: Put zip_export.bat in a Git repository.
    goto :fail
)

for %%D in ("%CD%") do set "FOLDER=%%~nxD"
set "OUTPUT=%CD%\%FOLDER%.zip"

rem Replace the previous archive, if present.
if exist "%OUTPUT%" del /f /q "%OUTPUT%"
if exist "%OUTPUT%" (
    echo ERROR: Cannot overwrite "%OUTPUT%".
    goto :fail
)

echo Exporting "%FOLDER%"...
echo.
rem Export tracked + untracked non-ignored files, including current edits.
rem Explicitly skip this batch file and the output ZIP to avoid self-inclusion.
git ls-files --cached --others --exclude-standard -z | "%SystemRoot%\System32\tar.exe" --null -a -cf "%OUTPUT%" --exclude="zip_export.bat" --exclude="%FOLDER%.zip" -T -
if errorlevel 1 (
    echo ERROR: Archive creation failed.
    if exist "%OUTPUT%" del /f /q "%OUTPUT%" >nul 2>&1
    goto :fail
)

echo.
echo Archive created: "%OUTPUT%"
popd
pause
exit /b 0

:fail
popd
pause
exit /b 1
