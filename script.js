document.addEventListener('DOMContentLoaded', () => {
    // --- URLs y constantes ---
    const CHAT_BACKEND_URL = 'https://imaplanner-backend.onrender.com/chat';
    const LEAD_BACKEND_URL = 'https://imaplanner-backend.onrender.com/submit-lead';
    const CALENDLY_URL = 'https://calendly.com/imaplanning';

    // --- Contenedores de Fases ---
    const phaseContainers = document.querySelectorAll('.phase-container');
    
    // --- Elementos Interactivos ---
    const startBtn = document.getElementById('start-btn');
    const formContinueBtn = document.getElementById('form-continue-btn');
    const addDependentBtn = document.getElementById('add-dependent-btn');
    const maritalStatusSelect = document.getElementById('form-marital-status');
    const partnerSection = document.getElementById('partner-section');
    const dependentsArea = document.getElementById('dependents-area');
    const chatWindow = document.getElementById('chat-window');
    const userInput = document.getElementById('user-input');
    const sendButton = document.getElementById('send-button');
    const calculatorContinueBtn = document.getElementById('calculator-continue-btn'); // Asumiendo que existe en el HTML de la calculadora
    
    let conversationHistory = [];
    let fullClientData = {};

    // --- LÓGICA DE NAVEGACIÓN ENTRE FASES ---
    function showPhase(phaseId) {
        phaseContainers.forEach(container => container.style.display = 'none');
        const activeContainer = document.getElementById(phaseId);
        if (activeContainer) {
            activeContainer.style.display = 'block';
        }
    }

    startBtn.addEventListener('click', () => {
        showPhase('chat-container');
        sendMessageToAI("Hola, inicia la conversación.");
    });

    formContinueBtn.addEventListener('click', () => {
        // Guardar datos del formulario...
        showPhase('calculator-container');
    });

    // --- LÓGICA DEL FORMULARIO INTELIGENTE ---
    maritalStatusSelect.addEventListener('change', () => {
        partnerSection.style.display = (maritalStatusSelect.value === 'Casado(a)/Unión Libre') ? 'block' : 'none';
    });

    addDependentBtn.addEventListener('click', (e) => {
        e.preventDefault();
        const newDependent = document.createElement('div');
        newDependent.classList.add('input-group');
        newDependent.innerHTML = `<input type="text" placeholder="Nombre Dependiente"><input type="date">`;
        dependentsArea.appendChild(newDependent);
    });
    
    // --- LÓGICA DEL CHAT ---
    async function sendMessageToAI(messageText) {
        if (!messageText || (messageText.trim() === '' && conversationHistory.length > 0)) return;
        
        if (conversationHistory.length > 0 || !messageText.toLowerCase().includes("inicia la conversación")) {
           addMessage(messageText, 'user');
        }
        conversationHistory.push({ role: 'user', parts: [{ text: messageText }] });
        userInput.value = '';
        toggleInput(true);
        showTypingIndicator();
        
        try {
            const response = await fetch(CHAT_BACKEND_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ history: conversationHistory }) });
            removeTypingIndicator();
            if (!response.ok) throw new Error('Respuesta del servidor no fue OK');
            const data = await response.json();
            if (data.error) throw new Error(data.error);
            const aiReply = data.reply;
            addMessage(aiReply, 'ai');
            conversationHistory.push({ role: 'model', parts: [{ text: aiReply }] });
            
            if (aiReply.toLowerCase().includes("formulario")) {
                setTimeout(() => showPhase('form-container'), 500);
            }
        } catch (error) {
            removeTypingIndicator();
            addMessage('Lo siento, hubo un problema de conexión. Por favor, recarga la página.', 'ai');
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
        if (typingElement) typingElement.remove();
    }
    function toggleInput(disabled) {
        userInput.disabled = disabled;
        sendButton.disabled = disabled;
    }
    
    sendButton.addEventListener('click', () => sendMessageToAI(userInput.value));
    userInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') sendMessageToAI(userInput.value);
    });

    // --- INICIO ---
    showPhase('welcome-container');
});
