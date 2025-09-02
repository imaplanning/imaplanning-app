# main.py - Versión Final con CORS Corregido
import google.generativeai as genai
import os
from flask import Flask, request, jsonify
from flask_cors import CORS # Asegúrate de que esta línea esté presente

app = Flask(__name__)

# CONFIGURACIÓN DE CORS
# Esta línea le da permiso explícitamente a tu frontend para que se comunique con el backend.
# Le estamos diciendo al "guardia de seguridad" que tu frontend está en la lista VIP.
CORS(app, resources={r"/chat": {"origins": "https://imaplanner.onrender.com"}})

@app.route('/chat', methods=['POST', 'OPTIONS'])
def chat_handler():
    # El método OPTIONS es para la "verificación previa" de CORS.
    if request.method == 'OPTIONS':
        return '', 204

    try:
        api_key = os.environ.get('GEMINI_API_KEY')
        if not api_key:
            return jsonify({"error": "API Key de Gemini no configurada."}), 500
        genai.configure(api_key=api_key)
        
        with open('prompt.txt', 'r', encoding='utf-8') as f:
            system_prompt = f.read()

        model = genai.GenerativeModel('gemini-1.5-flash')
        
        data = request.json
        conversation_history = data.get('history', [])
        
        full_history = [
            {'role': 'user', 'parts': [{'text': system_prompt}]},
            {'role': 'model', 'parts': [{'text': "Entendido. Estoy listo para actuar como IMA Planner."}]}
        ] + conversation_history

        chat_session = model.start_chat(history=full_history[:-1])
        last_user_message = conversation_history[-1]['parts'][0]['text']
        
        response = chat_session.send_message(last_user_message)

        return jsonify({"reply": response.text})

    except Exception as e:
        print(f"Ocurrió un error: {e}")
        return jsonify({"error": "Hubo un problema al procesar tu solicitud."}), 500

if __name__ == '__main__':
    app.run(port=8080, debug=True)