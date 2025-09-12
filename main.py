# main.py
import google.generativeai as genai
import os
from flask import Flask, request, jsonify
from flask_cors import CORS
import logging
# ... (otras importaciones)

app = Flask(__name__)
CORS(app)
logging.basicConfig(level=logging.INFO)

# Configuración de Gemini
try:
    API_KEY = os.environ.get('GEMINI_API_KEY')
    genai.configure(api_key=API_KEY)
    model = genai.GenerativeModel('gemini-1.5-flash')
except Exception as e:
    logging.error(f"Error al configurar Gemini: {e}")

# --- Endpoint del Chat (sin cambios) ---
@app.route('/chat', methods=['POST', 'OPTIONS'])
def chat_handler():
    # ...
    return jsonify({"reply": "Respuesta del chat"})

# --- Endpoint para Capturar Leads (actualizado para recibir más datos) ---
@app.route('/submit-lead', methods=['POST'])
def submit_lead_handler():
    # ... (lógica para recibir todos los datos y enviar el correo al asesor) ...
    return jsonify({"success": True})

# --- ✨ NUEVO Endpoint: Optimización de Gastos ✨ ---
@app.route('/get-suggestions', methods=['POST'])
def get_suggestions_handler():
    try:
        data = request.json
        expenses = data.get('expenses', {})
        
        prompt = f"""
        Actúa como un coach financiero empático en México. Analiza esta lista de gastos mensuales: {expenses}.
        Ofrece 3 sugerencias personalizadas, breves y accionables para optimizar el presupuesto sin sacrificar calidad de vida.
        """
        
        response = model.generate_content(prompt)
        return jsonify({"suggestions": response.text})
    except Exception as e:
        logging.error(f"Error en get_suggestions: {e}")
        return jsonify({"error": "No se pudieron generar sugerencias"}), 500

# --- ✨ NUEVO Endpoint: Carta "Volver al Futuro" ✨ ---
@app.route('/generate-future-letter', methods=['POST'])
def generate_future_letter_handler():
    try:
        client_data = request.json
        
        prompt = f"""
        Actúa como un asesor financiero empático de imaplanning. Escribe una carta inspiradora desde el futuro (10 años desde ahora) para tu cliente.
        DATOS DEL CLIENTE:
        - Nombre: {client_data.get('personal', {}).get('name', 'Cliente')}
        - Metas seleccionadas: {client_data.get('strategies', [])}
        
        En la carta, celebra el éxito que ha logrado gracias a las decisiones que tomó hoy. Conecta sus metas elegidas con su éxito futuro. Por ejemplo, si eligió 'Retiro', habla de su tranquilidad financiera.
        El tono debe ser positivo, motivador y breve (3 párrafos). Firma como "Tu Asesor, imaplanning."
        """
        
        response = model.generate_content(prompt)
        return jsonify({"letter": response.text})
    except Exception as e:
        logging.error(f"Error en generate_future_letter: {e}")
        return jsonify({"error": "No se pudo generar la carta"}), 500
