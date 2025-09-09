# main.py - Versión final con envío de leads por email
import google.generativeai as genai
import os
from flask import Flask, request, jsonify
from flask_cors import CORS
import logging
import smtplib
import ssl

app = Flask(__name__)
CORS(app)
logging.basicConfig(level=logging.INFO)

# --- Endpoint del Chat (sin cambios) ---
@app.route('/chat', methods=['POST', 'OPTIONS'])
def chat_handler():
    if request.method == 'OPTIONS':
        return '', 204
    try:
        # ... (toda la lógica del chat que ya teníamos) ...
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
        app.logger.error(f"Ocurrió un error inesperado en /chat: {e}")
        return jsonify({"error": "Hubo un problema al procesar tu solicitud."}), 500

# --- NUEVO Endpoint para Capturar Leads ---
@app.route('/submit-lead', methods=['POST'])
def submit_lead_handler():
    try:
        data = request.json
        whatsapp = data.get('whatsapp')
        email = data.get('email')

        if not whatsapp or not email:
            return jsonify({"error": "Faltan datos."}), 400

        # Credenciales de correo desde las variables de entorno de Render
        sender_email = os.environ.get('SENDER_EMAIL')
        email_password = os.environ.get('EMAIL_PASSWORD') # La contraseña de aplicación de 16 letras
        
        if not sender_email or not email_password:
            app.logger.error("Credenciales de correo no configuradas en el servidor.")
            return jsonify({"error": "Error de configuración del servidor."}), 500

        # Crear el cuerpo del correo
        subject = "Nuevo Lead de IMA Planner"
        body = f"""
        ¡Felicidades! Un nuevo prospecto ha completado la asesoría virtual.

        Datos de contacto:
        - WhatsApp: {whatsapp}
        - Correo: {email}

        Por favor, da el seguimiento correspondiente.
        """
        message = f"Subject: {subject}\n\n{body}"

        # Enviar el correo
        context = ssl.create_default_context()
        with smtplib.SMTP_SSL("smtp.gmail.com", 465, context=context) as server:
            server.login(sender_email, email_password)
            server.sendmail(sender_email, sender_email, message.encode('utf-8'))
        
        app.logger.info(f"Lead enviado exitosamente a {sender_email}")
        return jsonify({"success": True}), 200

    except Exception as e:
        app.logger.error(f"Ocurrió un error inesperado en /submit-lead: {e}")
        return jsonify({"error": "No se pudo enviar el lead."}), 500