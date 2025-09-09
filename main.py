# main.py
import google.generativeai as genai
import os
from flask import Flask, request, jsonify
from flask_cors import CORS
import logging

app = Flask(__name__)
# Configuración de CORS simplificada para máxima compatibilidad
CORS(app)

# Configuración de logging para ver las solicitudes entrantes en los logs de Render
logging.basicConfig(level=logging.INFO)

@app.route('/chat', methods=['POST', 'OPTIONS'])
def chat_handler():
    if request.method == 'OPTIONS':
        # Maneja la solicitud preflight de CORS
        return '', 204
    try:
        app.logger.info(f"Solicitud recibida de: {request.origin}")
        API_KEY = os.environ.get('GEMINI_API_KEY')
        if not API_KEY:
            app.logger.error("API Key de Gemini no configurada.")
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
        app.logger.info('Respuesta de IA generada exitosamente.')

        return jsonify({"reply": response.text})

    except Exception as e:
        app.logger.error(f"Ocurrió un error inesperado: {e}")
        return jsonify({"error": "Hubo un problema al procesar tu solicitud."}), 500