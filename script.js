document.addEventListener('DOMContentLoaded', () => {
    // --- URLs y constantes ---
    const CHAT_BACKEND_URL = 'https://imaplanner-backend.onrender.com/chat';
    const LEAD_BACKEND_URL = 'https://imaplanner-backend.onrender.com/submit-lead';
    const CALENDLY_URL = 'https://calendly.com/imaplanning';

    // --- Selectores de Elementos ---
    const phaseContainers = document.querySelectorAll('.phase-container');
    const startBtn = document.getElementById('start-btn');
    const privacyLink = document.getElementById('privacy-link');
    const modal = document.getElementById('privacy-modal');
    const closeModalBtn = document.querySelector('.close-button');
    const sendButton = document.getElementById('send-button');
    const userInput = document.getElementById('user-input');
    const chatWindow = document.getElementById('chat-window');
    const formContinueBtn = document.getElementById('form-continue-btn');
    const maritalStatusSelect = document.getElementById('form-marital-status');
    const partnerSection = document.getElementById('partner-section');
    const addDependentBtn = document.getElementById('add-dependent-btn');
    const dependentsArea = document.getElementById('dependents-area');
    const calculatorContinueBtn = document.getElementById('calculator-continue-btn');
    const strategyContinueBtn = document.getElementById('strategy-continue-btn');
    const submitContactButton = document.getElementById('submit-contact-button');
    const finalCtaContainer = document.getElementById('final-cta-container');
    const summaryNetIncome = document.getElementById('summary-net-income');
    const summaryTotalExpenses = document.getElementById('summary-total-expenses');
    const summaryCashFlow = document.getElementById('summary-cash-flow');

    let conversationHistory = [];
    let fullClientData = {};

    // --- LÓGICA DE NAVEGACIÓN ---
    function showPhase(phaseId) {
        phaseContainers.forEach(container => container.style.display = 'none');
        const activeContainer = document.getElementById(phaseId);
        if (activeContainer) {
            const displayStyle = (phaseId.includes('chat') || phaseId.includes('welcome')) ? 'flex' : 'block';
            activeContainer.style.display = displayStyle;
            if (displayStyle === 'flex') activeContainer.style.flexDirection = 'column';
        }
    }

    // --- EVENTOS INICIALES Y MODAL ---
    startBtn.addEventListener('click', () => {
        showPhase('chat-container');
        sendMessageToAI("Hola, inicia la conversación.");
    });
    privacyLink.addEventListener('click', (e) => { e.preventDefault(); modal.style.display = 'block'; });
    closeModalBtn.addEventListener('click', () => { modal.style.display = 'none'; });
    window.addEventListener('click', (e) => { if (e.target == modal) modal.style.display = 'none'; });

    // --- LÓGICA DEL FORMULARIO ---
    maritalStatusSelect.addEventListener('change', () => {
        partnerSection.style.display = (maritalStatusSelect.value === 'Casado(a)/Unión Libre') ? 'block' : 'none';
    });
    addDependentBtn.addEventListener('click', (e) => {
        e.preventDefault();
        const newDependent = document.createElement('div');
        newDependent.classList.add('input-group');
        newDependent.innerHTML = `<input type="text" placeholder="Nombre Dependiente" class="dependent-name"><input type="date" class="dependent-dob">`;
        dependentsArea.appendChild(newDependent);
    });
    formContinueBtn.addEventListener('click', () => {
        fullClientData.personal = {
            name: document.getElementById('form-name').value,
            dob: document.getElementById('form-dob').value,
            maritalStatus: maritalStatusSelect.value,
            partnerName: document.getElementById('form-partner-name').value,
            partnerDob: document.getElementById('form-partner-dob').value,
            profession: document.getElementById('form-profession').value,
            zipcode: document.getElementById('form-zipcode').value,
            taxRegime: document.getElementById('form-tax-regime').value
        };
        fullClientData.dependents = [];
        document.querySelectorAll('#dependents-area .input-group').forEach(dep => {
            fullClientData.dependents.push({
                name: dep.querySelector('.dependent-name').value,
                dob: dep.querySelector('.dependent-dob').value
            });
        });
        showPhase('calculator-container');
        updateSummary();
    });
    
    // --- LÓGICA DE LA CALCULADORA ---
    const satTable2025 = [ { lower: 0.01, upper: 855.35, fixed: 0.00, percent: 0.0192 }, { lower: 855.36, upper: 7262.35, fixed: 16.42, percent: 0.0640 }, { lower: 7262.36, upper: 12761.64, fixed: 426.41, percent: 0.1088 }, { lower: 12761.65, upper: 14832.72, fixed: 1021.57, percent: 0.1600 }, { lower: 14832.73, upper: 17762.63, fixed: 1352.94, percent: 0.1792 }, { lower: 17762.64, upper: 35823.31, fixed: 1875.90, percent: 0.2136 }, { lower: 35823.32, upper: 56462.83, fixed: 5733.99, percent: 0.2352 }, { lower: 56462.84, upper: 107789.26, fixed: 10584.28, percent: 0.3000 }, { lower: 107789.27, upper: 143718.99, fixed: 25982.21, percent: 0.3200 }, { lower: 143719.00, upper: 431156.99, fixed: 37480.34, percent: 0.3400 }, { lower: 431157.00, upper: Infinity, fixed: 135209.06, percent: 0.3500 } ];
    function calculateISR(grossIncome) { if (!grossIncome || grossIncome <= 0) return 0; const bracket = satTable2025.find(b => grossIncome >= b.lower && grossIncome <= b.upper); if (!bracket) return 0; return (grossIncome - bracket.lower) * bracket.percent + bracket.fixed; }
    function formatCurrency(value) { return `$${(value || 0).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,')}`; }
    
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
        return { cashFlow, grossIncome };
    }
    document.querySelectorAll('.calc-input').forEach(input => input.addEventListener('input', updateSummary));
    document.querySelectorAll('.add-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            const targetArea = document.getElementById(e.target.dataset.target);
            const newExpense = document.createElement('div');
            newExpense.classList.add('input-group', 'custom-expense');
            newExpense.innerHTML = `<input type="text" placeholder="Nombre del gasto"><input type="number" placeholder="0" class="calc-input expense-input">`;
            targetArea.appendChild(newExpense);
            newExpense.querySelector('.expense-input').addEventListener('input', updateSummary);
        });
    });

    calculatorContinueBtn.addEventListener('click', () => {
        fullClientData.financials = updateSummary();
        showPhase('strategy-container');
    });
    strategyContinueBtn.addEventListener('click', () => {
        showPhase('contact-form-container');
    });

    // --- LÓGICA DEL CHAT Y FORMULARIO FINAL ---
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
            if (!response.ok) throw new Error('La respuesta del servidor no fue exitosa.');
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
            addMessage('Lo siento, hubo un problema de conexión.', 'ai');
        } finally {
            toggleInput(false);
        }
    }
    submitContactButton.addEventListener('click', async () => {
        fullClientData.contact = {
            whatsapp: document.getElementById('contact-whatsapp').value,
            email: document.getElementById('contact-email').value
        };
        if (!fullClientData.contact.whatsapp || !fullClientData.contact.email) {
            alert('Por favor, completa ambos campos.'); return;
        }
        submitContactButton.disabled = true;
        submitContactButton.innerText = 'Enviando...';
        try {
            await fetch(LEAD_BACKEND_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ fullData: fullClientData }) });
            const formContent = document.querySelector('#contact-form-container');
            formContent.innerHTML = `<h4>¡Gracias!</h4><p>Hemos recibido tus datos y te enviaremos el resumen. Ahora puedes agendar tu asesoría.</p><a href="${CALENDLY_URL}" target="_blank" class="cta-button final-cta">Dar el Primer Paso Hacia este Futuro</a>`;
        } catch (error) {
            alert('Hubo un problema al enviar tus datos.');
            submitContactButton.disabled = false;
        }
    });
    
    // --- FUNCIONES AUXILIARES ---
    function addMessage(message, sender) { const e=document.createElement("div");e.classList.add("message",`${sender}-message`),e.innerText=message,chatWindow.appendChild(e),chatWindow.scrollTop=chatWindow.scrollHeight }
    function showTypingIndicator() { const e=document.createElement("div");e.id="typing-indicator",e.classList.add("message","ai-message"),e.innerText="...",chatWindow.appendChild(e),chatWindow.scrollTop=chatWindow.scrollHeight }
    function removeTypingIndicator() { const e=document.getElementById("typing-indicator");e&&e.remove() }
    function toggleInput(e){userInput.disabled=e,sendButton.disabled=e}
    sendButton.addEventListener('click', () => sendMessageToAI(userInput.value));
    userInput.addEventListener('keypress', (event) => { if (event.key === 'Enter') sendMessageToAI(userInput.value); });
    
    // --- INICIO DE LA APP ---
    showPhase('welcome-container');
});