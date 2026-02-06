from flask import Flask, jsonify
import pandas as pd
import io
import requests

app = Flask(__name__)

# --- CONFIGURACIÓN ---
# 1. Pega aquí el ID LARGO de tu documento (está entre /d/ y /edit en la URL)
DOC_ID = '1zMLnKjFwvzWSLRDX1N2dIETrY_RFLZhfTv0Z8LGznQ0'

# 2. Pega aquí el GID de la hoja que tiene la TABLA de datos (el número que copiaste)
# Si es la primera hoja, suele ser '0'.
SHEET_GID = '1298177878' 

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def catch_all(path):
    try:
        # Construimos la URL de exportación CSV dinámica
        csv_url = f'https://docs.google.com/spreadsheets/d/{DOC_ID}/export?format=csv&gid={SHEET_GID}'  
        
        # Descargamos
        response = requests.get(csv_url)
        response.raise_for_status()
        
        # Leemos con Pandas
        df = pd.read_csv(io.StringIO(response.text))
        df = df.fillna('-') # Rellenar vacíos
        
        # Preparamos datos para el HTML
        headers = df.columns.tolist()
        values = df.values.tolist()
        full_data = [headers] + values
        
        return jsonify({
            "status": "success",
            "data": full_data
        })
    except Exception as e:
        return jsonify({
            "status": "error",
            "message": f"Error leyendo Google Sheet: {str(e)}"
        }), 500

if __name__ == '__main__':
    app.run()