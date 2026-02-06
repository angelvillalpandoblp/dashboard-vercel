from flask import Flask, jsonify
import pandas as pd

app = Flask(__name__)

# TU ENLACE CSV DE GOOGLE SHEETS
SHEET_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRz-twPqsu_lE71K_KoXNLBTcz_rWkE98b2vGk1qC3o2MOr77CsJfYy3Zyem6koX-y3tZkShjayMvpq/pub?output=csv'

# Nota: En modo Zero Config sin vercel.json, Vercel suele ignorar 
# el decorador de ruta @app.route si no coincide con el nombre del archivo.
# Pero usaremos una ruta genérica '/' para atrapar la petición al archivo.

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def catch_all(path):
    try:
        # Leemos Google Sheets
        df = pd.read_csv(SHEET_CSV_URL)
        
        return jsonify({
            "status": "success",
            "message": "Python conectado exitosamente",
            "registros": len(df)
        })
    except Exception as e:
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500

if __name__ == '__main__':
    app.run()