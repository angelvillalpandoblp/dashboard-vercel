from flask import Flask, jsonify
import pandas as pd

app = Flask(__name__)

# PEGA AQUÍ EL ENLACE CSV QUE OBTUVISTE EN EL PASO 1 (Publicar > CSV)
SHEET_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRz-twPqsu_lE71K_KoXNLBTcz_rWkE98b2vGk1qC3o2MOr77CsJfYy3Zyem6koX-y3tZkShjayMvpq/pub?gid=0&single=true&output=csv'

@app.route('/api/data')
def get_data():
    try:
        # Leer directamente desde Google Sheets
        df = pd.read_csv(SHEET_CSV_URL)
        
        df = df.fillna('')
        
        # Calcular métricas para las tarjetas de resumen
        total_items = len(df)
        # Asegúrate que la columna se llame 'Estado' y el valor 'Faltante' exactamente igual que en tu Sheet
        faltantes = df[df['Estado'] == 'Faltante'].shape[0]
        
        records = df.to_dict(orient='records')
        
        return jsonify({
            "status": "success",
            "data": records,
            "metrics": {
                "total": total_items,
                "faltantes": faltantes
            }
        })
    except Exception as e:
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500

if __name__ == '__main__':
    app.run()