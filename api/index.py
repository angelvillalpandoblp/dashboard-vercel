from flask import Flask, jsonify, request
import pandas as pd
import io
import requests
import os
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

DOC_ID = '1zMLnKjFwvzWSLRDX1N2dIETrY_RFLZhfTv0Z8LGznQ0'

HOJAS = {
    'Gaveta_1': '0',
    'Gaveta_2': '597146696', 
    'Gaveta_3': '246003765', 
    'Gaveta_4': '328528636',
    'Gaveta_5': '1384584582', 
    'Gaveta_6': '1225160741' 
}

@app.route('/api/data')
def api_data():
    try:

        nombre_hoja = request.args.get('hoja', 'principal')
        
        sheet_gid = HOJAS.get(nombre_hoja, HOJAS['principal'])

        csv_url = f'https://docs.google.com/spreadsheets/d/{DOC_ID}/export?format=csv&gid={sheet_gid}'

        response = requests.get(csv_url, timeout=15)
        response.raise_for_status()

        df = pd.read_csv(io.StringIO(response.text))
        
        df = df.fillna(0) 

        datos_columnas = df.to_dict(orient='list')

        return jsonify({
            "status": "success",
            "hoja_actual": nombre_hoja,
            "data": datos_columnas
        })

    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route('/health')
def health():
    return jsonify({"status": "ok"})

if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)