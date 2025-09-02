// script.js
document.addEventListener('DOMContentLoaded', () => {
    // URL correcta apuntando al endpoint /chat
    const BACKEND_URL = 'https://imaplanner-backend.onrender.com/chat'; 
    const CALENDLY_URL = 'https://calendly.com/imaplanning';

    const chatWindow = document.getElementById('chat-window');
    const userInput = document.getElementById('user-input');
    const sendButton = document.getElementById('send-button');
    const contactFormContainer = document.getElementById('contact-form-container');
    const chatInputArea = document.querySelector('.chat-input-area');
    const submitContactButton = document.getElementById('submit-contact-button');

    let conversationHistory = [];

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
            if (!response.ok) {
                console.error(`Error del servidor: ${response.status} ${response.statusText}`);
                throw new Error('La respuesta del servidor no fue exitosa.');
            }
            
            const data = await response.json();
            if (data.error) {
                throw new Error(data.error);
            }

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

    submitContactButton.addEventListener('click', () => {
        const name = document.getElementById('contact-name').value;
        const email = document.getElementById('contact-email').value;
        if (name && email) {
            contactFormContainer.innerHTML = `<h4>¡Gracias, ${name}!</h4><p>Hemos recibido tus datos. Mientras tanto, puedes agendar una sesión directamente.</p><a href="${CALENDLY_URL}" target="_blank" id="submit-contact-button">Agendar Ahora</a>`;
        } else {
            alert('Por favor, completa tu nombre y correo electrónico.');
        }
    });

    // Iniciar conversación con un saludo inicial de la IA
    addMessage('¡Hola! Soy IMA Planner. Para construir tu plan, necesito hacerte algunas preguntas. ¿Estás listo para empezar?', 'ai');
});