// script.js - Versión final con envío de leads
document.addEventListener('DOMContentLoaded', () => {
    const CHAT_BACKEND_URL = 'https://imaplanner-backend.onrender.com/chat';
    const LEAD_BACKEND_URL = 'https://imaplanner-backend.onrender.com/submit-lead';
    const CALENDLY_URL = 'https://calendly.com/imaplanning';

    const chatWindow = document.getElementById('chat-window');
    const userInput = document.getElementById('user-input');
    const sendButton = document.getElementById('send-button');
    const contactFormContainer = document.getElementById('contact-form-container');
    const chatInputArea = document.querySelector('.chat-input-area');
    const submitContactButton = document.getElementById('submit-contact-button');

    let conversationHistory = [];

    // --- Lógica del Chat (sin cambios) ---
    async function sendMessageToAI(messageText) {
        if (messageText.trim() === '' || sendButton.disabled) return;
        addMessage(messageText, 'user');
        conversationHistory.push({ role: 'user', parts: [{ text: messageText }] });
        userInput.value = '';
        toggleInput(true);
        showTypingIndicator();
        try {
            const response = await fetch(CHAT_BACKEND_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ history: conversationHistory }),
            });
            removeTypingIndicator();
            if (!response.ok) throw new Error('La respuesta del servidor no fue exitosa.');
            const data = await response.json();
            if (data.error) throw new Error(data.error);
            const aiReply = data.reply;
            addMessage(aiReply, 'ai');
            conversationHistory.push({ role: 'model', parts: [{ text: aiReply }] });
            if (aiReply.toLowerCase().includes("whatsapp y correo")) {
                chatInputArea.style.display = 'none';
                contactFormContainer.style.display = 'block';
            }
        } catch (error) {
            removeTypingIndicator();
            console.error('Error al contactar a la IA:', error);
            addMessage('Lo siento, hubo un problema de conexión. Por favor, recarga la página e inténtalo de nuevo.', 'ai');
        } finally {
            toggleInput(false);
        }
    }
    
    // --- NUEVA Lógica del Formulario de Contacto ---
    submitContactButton.addEventListener('click', async () => {
        const whatsappInput = document.getElementById('contact-whatsapp');
        const emailInput = document.getElementById('contact-email');
        const whatsapp = whatsappInput.value;
        const email = emailInput.value;

        if (!whatsapp || !email) {
            alert('Por favor, completa ambos campos.');
            return;
        }

        submitContactButton.disabled = true;
        submitContactButton.innerText = 'Enviando...';

        try {
            const response = await fetch(LEAD_BACKEND_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ whatsapp, email }),
            });
            
            if (!response.ok) throw new Error('No se pudo enviar la información.');

            contactFormContainer.innerHTML = `<h4>¡Gracias!</h4><p>Hemos recibido tus datos y te hemos enviado el resumen. Ahora puedes agendar tu asesoría.</p><a href="${CALENDLY_URL}" target="_blank" class="submit-button-style">Agendar Ahora</a>`;
        } catch (error) {
            console.error('Error al enviar el lead:', error);
            alert('Hubo un problema al enviar tus datos. Por favor, inténtalo de nuevo.');
            submitContactButton.disabled = false;
            submitContactButton.innerText = 'Enviar PDF y Agendar';
        }
    });

    // ... (resto de funciones auxiliares como addMessage, showTypingIndicator, etc.) ...
    function addMessage(message, sender) {
        const messageElement = document.createElement('div');
        messageElement.classList.add('message', `${sender}-message`);
        messageElement.innerText = message;
        chatWindow.appendChild(messageElement);
        chatWindow.scrollTop = chatWindow.scrollHeight;
    }
    function showTypingIndicator() {
        const typingElement = document.createElement('div');
        typingElement.id = 'typing-indicator';
        typingElement.classList.add('message', 'ai-message');
        typingElement.innerText = '...';
        chatWindow.appendChild(typingElement);
        chatWindow.scrollTop = chatWindow.scrollHeight;
    }
    function removeTypingIndicator() {
        const typingElement = document.getElementById('typing-indicator');
        if (typingElement) chatWindow.removeChild(typingElement);
    }
    function toggleInput(disabled) {
        userInput.disabled = disabled;
        sendButton.disabled = disabled;
    }
    sendButton.addEventListener('click', () => sendMessageToAI(userInput.value));
    userInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') sendMessageToAI(userInput.value);
    });
    sendMessageToAI("Hola");
});