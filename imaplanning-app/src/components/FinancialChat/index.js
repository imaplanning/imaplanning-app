import React, { useState, useRef, useEffect } from 'react';
import FinancialAdvisorAgent from '../../agents/financial-agent';
import './FinancialChat.css';

const FinancialChat = () => {
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [agent] = useState(new FinancialAdvisorAgent());
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const initialResponse = agent.procesarMensaje('');
    setMessages([{
      id: 1,
      type: 'agent',
      content: initialResponse.mensaje,
      options: initialResponse.opciones,
      timestamp: new Date()
    }]);
  }, [agent]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = () => {
    if (!userInput.trim()) return;

    const userMessage = {
      id: messages.length + 1,
      type: 'user',
      content: userInput,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setUserInput('');

    setTimeout(() => {
      const agentResponse = agent.procesarMensaje(userInput);
      
      const newAgentMessage = {
        id: messages.length + 2,
        type: 'agent',
        content: agentResponse.mensaje,
        options: agentResponse.opciones,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, newAgentMessage]);
    }, 1000);
  };

  const handleOptionClick = (option) => {
    setUserInput(option.texto);
    setTimeout(() => {
      handleSendMessage();
    }, 100);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getProgreso = () => {
    return agent.getProgreso();
  };

  return (
    <div className="financial-chat">
      <div className="chat-header">
        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ width: `${getProgreso()}%` }}
          ></div>
        </div>
        <div className="progress-text">
          Progreso: {getProgreso()}% completado
        </div>
      </div>

      <div className="chat-container">
        <div className="messages-container">
          {messages.map((message) => (
            <div key={message.id} className={`message ${message.type}`}>
              <div className="message-content">
                {message.content.split('\n').map((line, index) => (
                  <p key={index}>{line}</p>
                ))}
              </div>
              
              {message.options && (
                <div className="message-options">
                  {message.options.map((option, index) => (
                    <button
                      key={index}
                      className="option-button"
                      onClick={() => handleOptionClick(option)}
                    >
                      {option.texto}
                    </button>
                  ))}
                </div>
              )}

              <div className="message-time">
                {message.timestamp.toLocaleTimeString([], { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
        
        <div className="input-container">
          <input
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Escribe tu respuesta o selecciona una opción..."
            className="chat-input"
          />
          <button 
            onClick={handleSendMessage} 
            className="send-button"
            disabled={!userInput.trim()}
          >
            ➤
          </button>
        </div>
      </div>
    </div>
  );
};

export default FinancialChat;