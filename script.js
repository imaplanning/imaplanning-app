document.addEventListener('DOMContentLoaded', () => {
    // --- URLs y contenedores principales ---
    const CHAT_BACKEND_URL = 'https://imaplanner-backend.onrender.com/chat';
    const LEAD_BACKEND_URL = 'https://imaplanner-backend.onrender.com/submit-lead';
    const CALENDLY_URL = 'https://calendly.com/imaplanning';

    const chatContainer = document.getElementById('chat-module-container');
    const calculatorContainer = document.getElementById('calculator-container');
    
    // --- Elementos del Chat ---
    const chatWindow = document.getElementById('chat-window');
    const userInput = document.getElementById('user-input');
    const sendButton = document.getElementById('send-button');
    const contactFormContainer = document.getElementById('contact-form-container');
    const chatInputArea = document.querySelector('.chat-input-area');
    
    // --- Elementos de la Calculadora ---
    const calculatorInputs = document.querySelectorAll('.calc-input');
    const continueButton = document.getElementById('calculator-continue-btn');
    const summaryNetIncome = document.getElementById('summary-net-income');
    const summaryTotalExpenses = document.getElementById('summary-total-expenses');
    const summaryCashFlow = document.getElementById('summary-cash-flow');

    let conversationHistory = [];

    // --- LÓGICA DE LA CALCULADORA ---

    const satTable2025 = [
        { lower: 0.01, upper: 855.35, fixed: 0.00, percent: 0.0192 },
        { lower: 855.36, upper: 7262.35, fixed: 16.42, percent: 0.0640 },
        { lower: 7262.36, upper: 12761.64, fixed: 426.41, percent: 0.1088 },
        { lower: 12761.65, upper: 14832.72, fixed: 1021.57, percent: 0.1600 },
        { lower: 14832.73, upper: 17762.63, fixed: 1352.94, percent: 0.1792 },
        { lower: 17762.64, upper: 35823.31, fixed: 1875.90, percent: 0.2136 },
        { lower: 35823.32, upper: 56462.83, fixed: 5733.99, percent: 0.2352 },
        { lower: 56462.84, upper: 107789.26, fixed: 10584.28, percent: 0.3000 },
        { lower: 107789.27, upper: 143718.99, fixed: 25982.21, percent: 0.3200 },
        { lower: 143719.00, upper: 431156.99, fixed: 37480.34, percent: 0.3400 },
        { lower: 431157.00, upper: Infinity, fixed: 135209.06, percent: 0.3500 }
    ];

    function calculateISR(grossIncome) {
        if (grossIncome <= 0) return 0;
        const bracket = satTable2025.find(b => grossIncome >= b.lower && grossIncome <= b.upper);
        if (!bracket) return 0;
        const surplus = grossIncome - bracket.lower;
        const marginalTax = surplus * bracket.percent;
        return bracket.fixed + marginalTax;
    }

    function updateSummary() {
        const grossIncome = parseFloat(document.getElementById('gross-income').value) || 0;
        const estimatedISR = calculateISR(grossIncome);
        const netIncome = grossIncome - estimatedISR;

        let totalExpenses = 0;
        document.querySelectorAll('.expense-input').forEach(input => {
            totalExpenses += parseFloat(input.value) || 0;
        });

        const cashFlow = netIncome - totalExpenses;

        summaryNetIncome.textContent = `$${netIncome.toFixed(2)}`;
        summaryTotalExpenses.textContent = `$${totalExpenses.toFixed(2)}`;
        summaryCashFlow.textContent = `$${cashFlow.toFixed(2)}`;
        
        return { netIncome, totalExpenses, cashFlow, estimatedISR };
    }

    calculatorInputs.forEach(input => input.addEventListener('input', updateSummary));
    
    continueButton.addEventListener('click', () => {
        const results = updateSummary();
        const annualReturnPotential = (results.estimatedISR * 12) * 0.15; // Simulación simple

        const summaryMessage = `Análisis de calculadora completado. Flujo de Efectivo Mensual: $${results.cashFlow.toFixed(2)}. Potencial de Devolución Anual estimado: $${annualReturnPotential.toFixed(2)}.`;
        
        // Oculta la calculadora, muestra el chat y envía los resultados a la IA
        calculatorContainer.style.display = 'none';
        chatContainer.style.display = 'flex';
        sendMessageToAI(summaryMessage);
    });

    // --- LÓGICA DEL CHAT ---
    
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
            if (!response.ok) throw new Error('Respuesta del servidor no fue OK');

            const data = await response.json();
            const aiReply = data.reply;
            addMessage(aiReply, 'ai');
            conversationHistory.push({ role: 'model', parts: [{ text: aiReply }] });

            // Lógica para mostrar la calculadora
            if (aiReply.toLowerCase().includes("calculadora")) {
                setTimeout(() => {
                    chatContainer.style.display = 'none';
                    calculatorContainer.style.display = 'block';
                }, 1000);
            }

            // Lógica para mostrar el formulario de contacto
            if (aiReply.toLowerCase().includes("whatsapp y correo")) {
                chatInputArea.style.display = 'none';
                // Implementación del formulario de contacto aquí
            }

        } catch (error) {
            // ... (manejo de errores del chat)
        } finally {
            toggleInput(false);
        }
    }

    // ... (resto de funciones del chat como addMessage, toggleInput, etc.)
    function addMessage(message, sender) {
        const messageElement = document.createElement('div');
        messageElement.classList.add('message', `${sender}-message`);
        messageElement.innerText = message;
        chatWindow.appendChild(messageElement);
        chatWindow.scrollTop = chatWindow.scrollHeight;
    }
    function showTypingIndicator() {
        // ...
    }
    function removeTypingIndicator() {
        // ...
    }
    function toggleInput(disabled) {
        userInput.disabled = disabled;
        sendButton.disabled = disabled;
    }
    sendButton.addEventListener('click', () => sendMessageToAI(userInput.value));
    userInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') sendMessageToAI(userInput.value);
    });
    
    // Iniciar la conversación
    sendMessageToAI("Hola");
});