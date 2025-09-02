document.addEventListener('DOMContentLoaded', () => {
    // --- CONFIGURACIÓN ---
    // ESTA URL LA OBTENDRÁS EN LA FASE 4 (DEPLOYMENT)
    const BACKEND_URL = 'https://imaplanner-backend.onrender.com'; 
    const CALENDLY_URL = 'https://calendly.com/imaplanning'; // Reemplaza con tu link de Calendly

    // --- ELEMENTOS DEL DOM ---
    const chatWindow = document.getElementById('chat-window');
    const userInput = document.getElementById('user-input');
    const sendButton = document.getElementById('send-button');
    const contactFormContainer = document.getElementById('contact-form-container');
    const chatInputArea = document.querySelector('.chat-input-area');
    const submitContactButton = document.getElementById('submit-contact-button');

    // --- HISTORIAL DE CONVERSACIÓN ---
    let conversationHistory = [];

    // --- LÓGICA DEL CHAT ---
    async function sendMessageToAI(messageText) {
        if (messageText.trim() === '' || sendButton.disabled) return;

        addMessage(messageText, 'user');
        conversationHistory.push({ role: 'user', parts: [{ text: messageText }] });
        userInput.value = '';
        toggleInput(true);
        showTypingIndicator();

        try {
            const response = await fetch(BACKEND_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ history: conversationHistory }),
            });

            removeTypingIndicator();
            if (!response.ok) throw new Error(`Error del servidor: ${response.statusText}`);
            
            const data = await response.json();
            const aiReply = data.reply;

            addMessage(aiReply, 'ai');
            conversationHistory.push({ role: 'model', parts: [{ text: aiReply }] });

            if (aiReply.includes("déjanos tus datos")) {
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

    // --- FUNCIONES AUXILIARES ---
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

    // --- MANEJADORES DE EVENTOS ---
    sendButton.addEventListener('click', () => sendMessageToAI(userInput.value));
    userInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') sendMessageToAI(userInput.value);
    });

    submitContactButton.addEventListener('click', () => {
        const name = document.getElementById('contact-name').value;
        const email = document.getElementById('contact-email').value;
        if (name && email) {
            console.log(`Lead capturado: Nombre=${name}, Email=${email}`);
            // Aquí podrías enviar esta info a un CRM o a tu email en un futuro
            contactFormContainer.innerHTML = `<h4>¡Gracias, ${name}!</h4><p>Hemos recibido tus datos. En breve nos pondremos en contacto contigo. Mientras tanto, puedes agendar una sesión directamente en nuestro calendario.</p><a href="${CALENDLY_URL}" target="_blank" id="submit-contact-button">Agendar Ahora</a>`;
        } else {
            alert('Por favor, completa tu nombre y correo electrónico.');
        }
    });

    // Iniciar conversación
    sendMessageToAI("Hola");
});