/* === CONFIGURACIÓN GENERAL Y VARIABLES === */
:root {
    --primary-color: #0d2c4e;
    --secondary-color: #0091AD;
    --accent-color: #d9534f;
    --light-bg: #f4f7f9;
    --white-bg: #ffffff;
    --light-text: #ffffff;
    --dark-text: #333;
    --border-color: #ccc;
    --shadow-color: rgba(0,0,0,0.05);
}

body {
    font-family: 'Roboto', sans-serif;
    background-color: var(--light-bg);
    color: var(--dark-text);
    margin: 0;
}

.main-container {
    display: flex;
    flex-direction: column;
    max-width: 800px;
    width: 100%;
    height: calc(100vh - 71px - 49px);
    margin: 0 auto;
    background-color: var(--white-bg);
    box-shadow: 0 4px 12px var(--shadow-color);
}

/* === ENCABEZADO Y FOOTER === */
.app-header {
    background-color: var(--primary-color);
    padding: 10px 25px;
    display: flex;
    align-items: center;
    color: var(--light-text);
}
.logo { height: 45px; margin-right: 15px; }
.app-header h1 { font-size: 1.3em; margin: 0; font-weight: 400; }
.app-footer { background-color: var(--primary-color); color: var(--light-bg); text-align: center; padding: 15px; font-size: 0.9em; }

/* === CONTENEDORES DE FASES Y BOTONES CTA === */
.phase-container {
    width: 100%;
    height: 100%;
    box-sizing: border-box;
    overflow-y: auto;
}
.form-view { padding: 20px 30px; }
.welcome-container {
    padding: 30px 40px;
    text-align: center;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
}
.welcome-container h2, .form-container h3, .strategy-container h3, .calculator-container h3 {
    color: var(--primary-color);
    text-align: center;
    font-size: 1.6em;
}
.welcome-container p { font-size: 1.1em; line-height: 1.6; max-width: 600px; }
.privacy-notice a { color: var(--secondary-color); text-decoration: none; }
.cta-button {
    background-color: var(--accent-color);
    color: var(--light-text);
    padding: 15px 30px;
    font-size: 1.1em;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    margin-top: 20px;
    transition: background-color 0.3s;
    text-decoration: none;
    display: inline-block;
    width: auto;
}
.cta-button:hover { background-color: #c9302c; }
.cta-button:disabled { background-color: #ccc; cursor: not-allowed; }
.final-cta { margin-top: 20px; display: block; text-align: center; }

/* === FORMULARIO INTELIGENTE === */
.form-section { text-align: left; margin-bottom: 25px; border-top: 1px solid #eee; padding-top: 20px; }
.form-section h4 { color: var(--secondary-color); margin-top: 0; }
.input-group { display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; margin-bottom: 12px; gap: 10px; }
.input-group label { font-size: 1em; flex-basis: 40%; }
.input-group input, .input-group select { padding: 10px; border: 1px solid var(--border-color); border-radius: 5px; font-size: 1em; flex-grow: 1; flex-basis: 55%; box-sizing: border-box; }
.add-btn { background: none; border: 1px dashed var(--secondary-color); color: var(--secondary-color); cursor: pointer; padding: 5px 10px; border-radius: 5px; margin-top: 10px; font-size: 0.9em;}

/* === MÓDULO DE CHAT === */
.chat-container { display: flex; flex-direction: column; }
.chat-window { flex-grow: 1; padding: 20px; overflow-y: auto; display: flex; flex-direction: column; gap: 15px; }
.message { padding: 12px 18px; border-radius: 20px; max-width: 80%; line-height: 1.6; word-wrap: break-word; animation: fadeIn 0.5s ease-in-out; }
.ai-message { background-color: #e9f2ff; color: var(--primary-color); align-self: flex-start; }
.user-message { background-color: var(--secondary-color); color: var(--light-text); align-self: flex-end; }
.chat-input-area { display: flex; padding: 15px; border-top: 1px solid #e0e0e0; }
#user-input { flex-grow: 1; border: 1px solid var(--border-color); border-radius: 25px; padding: 10px 20px; font-size: 1em; }
#send-button { background-color: var(--primary-color); color: var(--light-text); border: none; border-radius: 25px; padding: 10px 25px; margin-left: 10px; cursor: pointer; }

/* === CALCULADORA Y ESTRATEGIAS === */
.calculator-summary { background-color: var(--primary-color); color: var(--light-text); padding: 20px; border-radius: 8px; margin-bottom: 25px; text-align: right; }
.summary-item { margin-bottom: 8px; }
.summary-item.main-summary { font-size: 1.2em; font-weight: bold; margin-top: 10px; border-top: 1px solid #ffffff44; padding-top: 10px; }
.calculator-section h4 { font-size: 1.5em; color: var(--primary-color); border-bottom: 2px solid var(--secondary-color); padding-bottom: 5px; margin: 30px 0 20px 0; }
.expense-category h5 { font-size: 1.2em; margin-bottom: 5px; }
.custom-expense { display: grid; grid-template-columns: 1fr auto; gap: 10px; margin-top: 10px; align-items: center;}
.strategy-table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 0.9em; }
.strategy-table th, .strategy-table td { border: 1px solid #ddd; padding: 8px; text-align: left; vertical-align: middle; }
.strategy-table th { background-color: #e9f2ff; }
.strategy-table input[type="checkbox"] { transform: scale(1.3); margin-right: 5px; }
.strategy-table td:first-child { text-align: center; }

/* === MODAL DE PRIVACIDAD === */
.modal { display: none; position: fixed; z-index: 1000; left: 0; top: 0; width: 100%; height: 100%; background-color: rgba(0,0,0,0.6); }
.modal-content { background-color: #fefefe; margin: 15% auto; padding: 20px 30px; border: 1px solid #888; width: 80%; max-width: 600px; border-radius: 8px; position: relative; animation: fadeIn 0.3s; }
.close-button { color: #aaa; position: absolute; top: 10px; right: 20px; font-size: 28px; font-weight: bold; cursor: pointer; }

@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

