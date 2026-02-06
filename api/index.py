from flask import Flask, jsonify
import pandas as pd
import io
import requests
import os
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # <-- MUY IMPORTANTE

DOC_ID = '1zMLnKjFwvzWSLRDX1N2dIETrY_RFLZhfTv0Z8LGznQ0'
SHEET_GID = '1298177878'


@app.route('/api/data')
def api_data():
    try:
        csv_url = f'https://docs.google.com/spreadsheets/d/{DOC_ID}/export?format=csv&gid={SHEET_GID}'

        response = requests.get(csv_url, timeout=15)
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


@app.route('/health')
def health():
    return jsonify({"status": "ok"})


if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)
