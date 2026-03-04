from flask import Flask, jsonify, request
import pandas as pd
import io
import requests
import os
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

DOC_ID = '1zMLnKjFwvzWSLRDX1N2dIETrY_RFLZhfTv0Z8LGznQ0'

# AQUI PONES TUS HOJAS: El nombre que quieras darle y su GID (el número al final de la URL en Google Sheets)
HOJAS = {
    'Gaveta 1': '0',
    'Gaveta 2': '597146696', # Ejemplo: la primera hoja suele tener gid=0
    'Gaveta 3': '246003765', # Pon el GID de cualquier otra hoja que tengas
    'Gaveta 4': '328528636', # Pon el GID de cualquier otra hoja que tengas
    'Gaveta 5': '1384584582', # Pon el GID de cualquier otra hoja que tengas
    'Gaveta 6': '1225160741' # Pon el GID de cualquier otra hoja que tengas
}

@app.route('/api/data')
def api_data():
    try:
        # Obtenemos el nombre de la hoja desde la URL (ej: /api/data?hoja=principal)
        # Si no nos piden ninguna, usamos 'principal' por defecto
        nombre_hoja = request.args.get('hoja', 'principal')
        
        # Buscamos el GID correspondiente. Si no existe, usamos el principal
        sheet_gid = HOJAS.get(nombre_hoja, HOJAS['principal'])

        csv_url = f'https://docs.google.com/spreadsheets/d/{DOC_ID}/export?format=csv&gid={sheet_gid}'

        response = requests.get(csv_url, timeout=15)
        response.raise_for_status()

        df = pd.read_csv(io.StringIO(response.text))
        
        # IMPORTANTE PARA GRÁFICAS: 
        # Rellenamos los vacíos con 0 en lugar de '-' para que Plotly no falle al sumar o graficar
        df = df.fillna(0) 

        # TRUCO DE ORO PARA PLOTLY:
        # Convertimos el DataFrame a un diccionario de columnas.
        # En vez de filas, nos dará: {"Mes":["Ene", "Feb"], "Ventas": [10, 20]}
        # Que es exactamente lo que Plotly necesita en Javascript.
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