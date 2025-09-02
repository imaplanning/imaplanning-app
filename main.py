# main.py - Versión final con múltiples orígenes permitidos
import google.generativeai as genai
import os
from flask import Flask, request, jsonify
from flask_cors import CORS
import logging

app = Flask(__name__)

# Lista de orígenes permitidos
allowed_origins = [
    "https://imaplanner.onrender.com",  # La dirección de Render
    "https://imaplanning.github.io"   # La nueva dirección de GitHub Pages
]

# Configuración de CORS para permitir conexiones solo de esas direcciones
CORS(app, resources={r"/chat": {"origins": allowed_origins}})

logging.basicConfig(level=logging.INFO)

@app.route('/chat', methods=['POST', 'OPTIONS'])
def chat_handler():
    if request.method == 'OPTIONS':
        return '', 204
    try:
        app.logger.info(f"Solicitud recibida de: {request.origin}")
        API_KEY = os.environ.get('GEMINI_API_KEY')
        if not API_KEY:
            return jsonify({"error": "Configuración del servidor incompleta."}), 500
            
        genai.configure(api_key=API_KEY)
        model = genai.GenerativeModel('gemini-1.5-flash')

        with open('prompt.txt', 'r', encoding='utf-8') as f:
            SYSTEM_PROMPT = f.read()

        data = request.json
        conversation_history = data.get('history', [])
        
        full_history = [
            {'role': 'user', 'parts': [{'text': SYSTEM_PROMPT}]},
            {'role': 'model', 'parts': [{'text': "Entendido. Estoy listo para actuar como IMA Planner."}]}
        ] + conversation_history
        
        chat_session = model.start_chat(history=full_history[:-1])
        last_user_message = conversation_history[-1]['parts'][0]['text']
        
        response = chat_session.send_message(last_user_message)

        return jsonify({"reply": response.text})

    except Exception as e:
        app.logger.error(f"Ocurrió un error inesperado: {e}")
        return jsonify({"error": "Hubo un problema al procesar tu solicitud."}), 500