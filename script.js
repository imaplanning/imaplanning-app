document.addEventListener('DOMContentLoaded', () => {
    const startBtn = document.getElementById('start-btn');
    const welcomeContainer = document.getElementById('welcome-container');
    const chatModuleContainer = document.getElementById('chat-module-container');
    const sendButton = document.getElementById('send-button');
    const userInput = document.getElementById('user-input');
    const chatWindow = document.getElementById('chat-window');

    const BACKEND_URL = 'https://imaplanner-backend.onrender.com/chat';

    startBtn.addEventListener('click', () => {
        welcomeContainer.style.display = 'none';
        chatModuleContainer.style.display = 'block';
        addMessageToChat('¡Hola! Soy IMA Planner. Gracias por dar el primer paso. Para iniciar tu diagnóstico, por favor, dime tu nombre.', 'bot');
    });

    sendButton.addEventListener('click', sendMessage);
    userInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            sendMessage();
        }
    });

    function sendMessage() {
        const messageText = userInput.value.trim();
        if (messageText === '') return;

        addMessageToChat(messageText, 'user');
        userInput.value = '';
        getBotResponse(messageText);
    }

    function addMessageToChat(text, sender) {
        const messageElement = document.createElement('div');
        messageElement.classList.add('chat-message', `${sender}-message`);
        messageElement.textContent = text;
        chatWindow.appendChild(messageElement);
        chatWindow.scrollTop = chatWindow.scrollHeight;
    }

    async function getBotResponse(userMessage) {
        try {
            const response = await fetch(BACKEND_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ message: userMessage })
            });

            if (!response.ok) {
                throw new Error(`Error en la respuesta del servidor: ${response.statusText}`);
            }

            const data = await response.json();
            const botMessage = data.response;

            addMessageToChat(botMessage, 'bot');

        } catch (error) {
            console.error('Error al conectar con el backend:', error);
            addMessageToChat('Lo siento, estoy teniendo problemas para conectarme. Por favor, intenta de nuevo más tarde.', 'bot');
        }
    }

    const privacyModal = document.getElementById('privacy-modal');
    const privacyLink = document.getElementById('privacy-link');
    const closeBtn = document.querySelector('.close-btn');

    privacyLink.onclick = function(event) {
        event.preventDefault();
        privacyModal.style.display = "block";
    }

    closeBtn.onclick = function() {
        privacyModal.style.display = "none";
    }

    window.onclick = function(event) {
        if (event.target == privacyModal) {
            privacyModal.style.display = "none";
        }
    }
});