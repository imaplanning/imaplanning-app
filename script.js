document.addEventListener('DOMContentLoaded', () => {
    // --- URLs y constantes ---
    const CHAT_BACKEND_URL = 'https://imaplanner-backend.onrender.com/chat';
    const LEAD_BACKEND_URL = 'https://imaplanner-backend.onrender.com/submit-lead';
    const CALENDLY_URL = 'https://calendly.com/imaplanning';

    // --- Contenedores de Fases ---
    const welcomeContainer = document.getElementById('welcome-container');
    const chatContainer = document.getElementById('chat-module-container');
    const formContainer = document.getElementById('form-container');
    const calculatorContainer = document.getElementById('calculator-container');
    const strategyContainer = document.getElementById('strategy-container');
    const contactFormContainer = document.getElementById('contact-form-container');
    
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
    const chatInputArea = document.querySelector('.chat-input-area');
    const submitContactButton = document.getElementById('submit-contact-button');
    const continueButton = document.getElementById('calculator-continue-btn');
    const summaryNetIncome = document.getElementById('summary-net-income');
    const summaryTotalExpenses = document.getElementById('summary-total-expenses');
    const summaryCashFlow = document.getElementById('summary-cash-flow');

    let conversationHistory = [];
    let fullClientData = {};

    // --- LÓGICA DE NAVEGACIÓN ENTRE FASES ---
    function showPhase(phaseId) {
        [welcomeContainer, chatContainer, formContainer, calculatorContainer, strategyContainer, contactFormContainer].forEach(container => {
            if (container) container.style.display = 'none';
        });
        const activeContainer = document.getElementById(phaseId);
        if (activeContainer) {
            activeContainer.style.display = (phaseId === 'chat-module-container' || phaseId === 'main-container') ? 'flex' : 'block';
        }
    }

    startBtn.addEventListener('click', () => {
        showPhase('chat-module-container');
        sendMessageToAI("Hola, inicia la conversación.");
    });

    formContinueBtn.addEventListener('click', () => {
        // Guardar datos del formulario en el objeto global
        fullClientData.personal = {
            name: document.getElementById('form-name').value,
            dob: document.getElementById('form-dob').value,
            maritalStatus: maritalStatusSelect.value,
            partnerName: maritalStatusSelect.value === 'Casado(a)/Unión Libre' ? document.getElementById('form-partner-name').value : null,
            partnerDob: maritalStatusSelect.value === 'Casado(a)/Unión Libre' ? document.getElementById('form-partner-dob').value : null
        };
        //... guardar el resto de datos
        showPhase('calculator-container');
        updateSummary();
    });

    // --- LÓGICA DEL FORMULARIO INTELIGENTE ---
    maritalStatusSelect.addEventListener('change', () => {
        partnerSection.style.display = (maritalStatusSelect.value === 'Casado(a)/Unión Libre') ? 'block' : 'none';
    });

    addDependentBtn.addEventListener('click', (e) => {
        e.preventDefault();
        const dependentCount = dependentsArea.children.length;
        const newDependent = document.createElement('div');
        newDependent.classList.add('input-group');
        newDependent.innerHTML = `
            <input type="text" placeholder="Nombre Dependiente ${dependentCount + 1}" class="dependent-name">
            <input type="date" class="dependent-dob">
        `;
        dependentsArea.appendChild(newDependent);
    });
    
    // --- LÓGICA DE LA CALCULADORA ---
    const satTable2025 = [
        { lower: 0.01, upper: 855.35, fixed: 0.00, percent: 0.0192 }, { lower: 855.36, upper: 7262.35, fixed: 16.42, percent: 0.0640 }, { lower: 7262.36, upper: 12761.64, fixed: 426.41, percent: 0.1088 }, { lower: 12761.65, upper: 14832.72, fixed: 1021.57, percent: 0.1600 }, { lower: 14832.73, upper: 17762.63, fixed: 1352.94, percent: 0.1792 }, { lower: 17762.64, upper: 35823.31, fixed: 1875.90, percent: 0.2136 }, { lower: 35823.32, upper: 56462.83, fixed: 5733.99, percent: 0.2352 }, { lower: 56462.84, upper: 107789.26, fixed: 10584.28, percent: 0.3000 }, { lower: 107789.27, upper: 143718.99, fixed: 25982.21, percent: 0.3200 }, { lower: 143719.00, upper: 431156.99, fixed: 37480.34, percent: 0.3400 }, { lower: 431157.00, upper: Infinity, fixed: 135209.06, percent: 0.3500 }
    ];

    function calculateISR(grossIncome) {
        if (!grossIncome || grossIncome <= 0) return 0;
        const bracket = satTable2025.find(b => grossIncome >= b.lower && grossIncome <= b.upper);
        if (!bracket) return 0;
        return (grossIncome - bracket.lower) * bracket.percent + bracket.fixed;
    }

    function formatCurrency(value) {
        return `$${(value || 0).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,')}`;
    }

    function updateSummary() {
        const grossIncome = parseFloat(document.getElementById('gross-income').value) || 0;
        const netIncome = grossIncome - calculateISR(grossIncome);
        let totalExpenses = 0;
        document.querySelectorAll('.expense-input').forEach(input => {
            totalExpenses += parseFloat(input.value) || 0;
        });
        const cashFlow = netIncome - totalExpenses;

        summaryNetIncome.textContent = formatCurrency(netIncome);
        summaryTotalExpenses.textContent = formatCurrency(totalExpenses);
        summaryCashFlow.textContent = formatCurrency(cashFlow);
        
        return { cashFlow, netIncome, grossIncome, totalExpenses };
    }

    document.querySelectorAll('.calc-input').forEach(input => input.addEventListener('input', updateSummary));

    continueButton.addEventListener('click', () => {
        const results = updateSummary();
        fullClientData.financials = results;
        const summaryMessage = `Análisis de calculadora completado. Flujo de Efectivo Mensual: ${formatCurrency(results.cashFlow)}.`;
        showPhase('chat-module-container');
        sendMessageToAI(summaryMessage);
    });

    document.querySelectorAll('.add-expense-btn').forEach(button => {
        button.addEventListener('click', (event) => {
            event.preventDefault();
            const targetId = event.target.dataset.target;
            const targetArea = document.getElementById(targetId);
            const newExpenseGroup = document.createElement('div');
            newExpenseGroup.classList.add('input-group', 'custom-expense');
            newExpenseGroup.innerHTML = `
                <input type="text" placeholder="Nombre del gasto" class="custom-expense-name">
                <input type="number" placeholder="0" class="calc-input expense-input custom-expense-amount">
            `;
            targetArea.appendChild(newExpenseGroup);
            newExpenseGroup.querySelector('.expense-input').addEventListener('input', updateSummary);
        });
    });

    // --- LÓGICA DEL CHAT Y FORMULARIO DE CONTACTO FINAL ---
    async function sendMessageToAI(messageText) {
        if (messageText.trim() === '' && conversationHistory.length > 0) return;
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
            if (aiReply.toLowerCase().includes("whatsapp y correo")) {
                showPhase('contact-form-container');
            }
        } catch (error) {
            removeTypingIndicator();
            addMessage('Lo siento, hubo un problema de conexión. Por favor, recarga la página e inténtalo de nuevo.', 'ai');
        } finally {
            toggleInput(false);
        }
    }
    
    submitContactButton.addEventListener('click', async () => {
        // ... Lógica para enviar el lead ...
    });
    
    // --- FUNCIONES AUXILIARES Y MANEJADORES DE EVENTOS ---
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