# Instalar flask --> pip install flask flask-cors pandas scikit-learn
from flask import Flask, request, jsonify
from flask_cors import CORS
from model.IA import generar_recomendacion
import pandas as pd

app = Flask(__name__)
CORS(app)

@app.route('/generar-rutina', methods=['POST'])
def generar_rutina_api():
    try:
        datos = request.json
        resultado = generar_recomendacion(datos)
        
        if isinstance(resultado, dict):
            return jsonify({
                'status': 'success',
                'rutina': resultado['rutina'],
                'metricas': resultado['metricas']
            })
        else:
            return jsonify({
                'status': 'error',
                'message': resultado.iloc[0]['Error']
            }), 400
            
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

@app.route('/')
def index():
    return "API de Entrenamiento Personal - Usa el endpoint /generar-rutina"

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)