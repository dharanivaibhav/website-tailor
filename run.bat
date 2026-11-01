@echo off
echo ====================================================
echo Starting Dharani Women's Tailors Frontend ^& Backend
echo ====================================================
echo.
echo Installing dependencies if needed...
python -m pip install -r requirements.txt
echo.
echo Starting Flask Server at http://127.0.0.1:5000
echo - Frontend: http://127.0.0.1:5000/
echo - Admin Portal: http://127.0.0.1:5000/admin
echo - REST APIs: http://127.0.0.1:5000/api/appointments
echo.
python app.py
pause
