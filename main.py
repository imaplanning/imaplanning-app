# main.py - Versión final y completa
import google.generativeai as genai
import os
from flask import Flask, request, jsonify
from flask_cors import CORS
import logging
import smtplib
import ssl
import json

app = Flask(__name__)
# Configuración de CORS para permitir conexiones de tus dominios
allowed_origins = [
    "https://imaplanner.onrender.com",
    "https://imaplanning.github.io"
]
CORS(app, resources={r"/*": {"origins": allowed_origins}})

logging.basicConfig(level=logging.INFO)

# --- Endpoint del Chat ---
@app.route('/chat', methods=['POST', 'OPTIONS'])
def chat_handler():
    if request.method == 'OPTIONS':
        return '', 204
    try:
        app.logger.info(f"Solicitud de chat recibida de: {request.origin}")
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
    except FileNotFoundError:
        app.logger.error("Error: El archivo 'prompt.txt' no se encontró.")
        return jsonify({"error": "Error de configuración del servidor: falta un archivo."}), 500
    except Exception as e:
        app.logger.error(f"Ocurrió un error inesperado en /chat: {e}")
        return jsonify({"error": "Hubo un problema al procesar tu solicitud."}), 500

# --- Endpoint para Capturar Leads ---
@app.route('/submit-lead', methods=['POST'])
def submit_lead_handler():
    try:
        data = request.json
        full_data = data.get('fullData', {})
        
        if not full_data:
            return jsonify({"error": "No se recibieron datos del lead."}), 400

        # Credenciales de correo desde las variables de entorno de Render
        sender_email = os.environ.get('SENDER_EMAIL')
        email_password = os.environ.get('EMAIL_PASSWORD')
        
        if not sender_email or not email_password:
            app.logger.error("Credenciales de correo no configuradas en el servidor.")
            return jsonify({"error": "Error de configuración del servidor."}), 500

        # Formatear el cuerpo del correo con toda la información del cliente
        subject = f"Nuevo Lead de IMA Planner: {full_data.get('personal', {}).get('name', 'N/A')}"
        
        # Usamos json.dumps para formatear el objeto de datos de forma legible
        pretty_data = json.dumps(full_data, indent=2, ensure_ascii=False)
        
        body = f"""
        ¡Felicidades! Un nuevo prospecto ha completado el Asesor Virtual.

        A continuación se muestra toda la información recopilada para tu seguimiento:

        {pretty_data}
        """
        message = f"Subject: {subject}\n\n{body}"

        # Enviar el correo
        context = ssl.create_default_context()
        with smtplib.SMTP_SSL("smtp.gmail.com", 465, context=context) as server:
            server.login(sender_email, email_password)
            # El email se envía al mismo remitente (el asesor)
            server.sendmail(sender_email, sender_email, message.encode('utf-8'))
        
        app.logger.info(f"Lead enviado exitosamente a {sender_email}")
        return jsonify({"success": True}), 200

    except Exception as e:
        app.logger.error(f"Ocurrió un error inesperado en /submit-lead: {e}")
        return jsonify({"error": "No se pudo enviar el lead."}), 500