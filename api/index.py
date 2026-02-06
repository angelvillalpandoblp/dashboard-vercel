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

@app.route('/api/index')
def api_index():
    try:
        csv_url = f'https://docs.google.com/spreadsheets/d/{DOC_ID}/export?format=csv&gid={SHEET_GID}'
        response = requests.get(csv_url)
        response.raise_for_status()

        df = pd.read_csv(io.StringIO(response.text))
        df = df.fillna('-')

        return jsonify({
            "status": "success",
            "data": [df.columns.tolist()] + df.values.tolist()
        })
    except Exception as e:
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500


if __name__ == '__main__':
    app.run()