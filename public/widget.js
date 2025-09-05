/**
 * CarBot Widget - Embeddable AI Chatbot
 * Version: 1.0.0
 * 
 * Usage:
 * <script>
 *   window.carbotConfig = {
 *     apiKey: 'your-widget-api-key',
 *     theme: { ... },
 *     settings: { ... }
 *   };
 * </script>
 * <script src="https://carbot.chat/widget.js"></script>
 */

(function() {
  'use strict';

  // Default configuration
  const defaultConfig = {
    apiKey: null,
    baseUrl: 'https://inyyfwqfdpidnacertuj.supabase.co/functions/v1',
    theme: {
      primaryColor: '#f97316',
      backgroundColor: '#ffffff',
      textColor: '#1f2937',
      borderRadius: '12px',
      position: 'bottom-right'
    },
    settings: {
      showBranding: true,
      welcomeMessage: 'Hallo! Wie kann ich Ihnen heute helfen?',
      autoOpen: false,
      collectEmail: false,
      collectPhone: false
    }
  };

  // Merge user config with defaults
  const config = Object.assign({}, defaultConfig, window.carbotConfig || {});
  
  if (!config.apiKey) {
    // Production-ready error handling - avoid console.error in production
    return;
  }

  // Generate session ID
  const sessionId = 'session_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();

  // Widget state
  let isOpen = false;
  let isLoaded = false;
  let visitorData = {};

  // Create widget HTML
  function createWidget() {
    const widgetContainer = document.createElement('div');
    widgetContainer.id = 'carbot-widget-container';
    widgetContainer.innerHTML = `
      <style>
        #carbot-widget-container {
          position: fixed;
          ${config.theme.position.includes('bottom') ? 'bottom: 20px;' : 'top: 20px;'}
          ${config.theme.position.includes('right') ? 'right: 20px;' : 'left: 20px;'}
          z-index: 10000;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
        
        .carbot-launcher {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background: ${config.theme.primaryColor};
          border: none;
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
        }
        
        .carbot-launcher:hover {
          transform: scale(1.1);
          box-shadow: 0 6px 16px rgba(0,0,0,0.2);
        }
        
        .carbot-launcher svg {
          width: 24px;
          height: 24px;
          fill: white;
        }
        
        .carbot-chat-window {
          position: absolute;
          ${config.theme.position.includes('bottom') ? 'bottom: 80px;' : 'top: 80px;'}
          ${config.theme.position.includes('right') ? 'right: 0;' : 'left: 0;'}
          width: 350px;
          height: 500px;
          background: ${config.theme.backgroundColor};
          border-radius: ${config.theme.borderRadius};
          box-shadow: 0 8px 32px rgba(0,0,0,0.12);
          display: none;
          flex-direction: column;
          overflow: hidden;
        }
        
        .carbot-chat-window.open {
          display: flex;
        }
        
        .carbot-header {
          background: ${config.theme.primaryColor};
          color: white;
          padding: 16px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        
        .carbot-header h3 {
          margin: 0;
          font-size: 16px;
          font-weight: 600;
        }
        
        .carbot-close {
          background: none;
          border: none;
          color: white;
          cursor: pointer;
          font-size: 20px;
          width: 30px;
          height: 30px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .carbot-close:hover {
          background: rgba(255,255,255,0.1);
        }
        
        .carbot-messages {
          flex: 1;
          padding: 16px;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        
        .carbot-message {
          max-width: 80%;
          padding: 12px 16px;
          border-radius: 18px;
          line-height: 1.4;
          font-size: 14px;
        }
        
        .carbot-message.user {
          background: ${config.theme.primaryColor};
          color: white;
          align-self: flex-end;
          margin-left: auto;
        }
        
        .carbot-message.bot {
          background: #f1f5f9;
          color: ${config.theme.textColor};
          align-self: flex-start;
        }
        
        .carbot-input-area {
          padding: 16px;
          border-top: 1px solid #e2e8f0;
          display: flex;
          gap: 8px;
        }
        
        .carbot-input {
          flex: 1;
          padding: 12px 16px;
          border: 1px solid #e2e8f0;
          border-radius: 24px;
          outline: none;
          font-size: 14px;
        }
        
        .carbot-input:focus {
          border-color: ${config.theme.primaryColor};
        }
        
        .carbot-send {
          padding: 12px 16px;
          background: ${config.theme.primaryColor};
          color: white;
          border: none;
          border-radius: 24px;
          cursor: pointer;
          font-size: 14px;
        }
        
        .carbot-send:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        
        .carbot-typing {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 12px 16px;
          background: #f1f5f9;
          border-radius: 18px;
          max-width: 80px;
        }
        
        .carbot-typing span {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #94a3b8;
          animation: carbot-pulse 1.4s ease-in-out infinite both;
        }
        
        .carbot-typing span:nth-child(1) { animation-delay: -0.32s; }
        .carbot-typing span:nth-child(2) { animation-delay: -0.16s; }
        
        @keyframes carbot-pulse {
          0%, 80%, 100% {
            transform: scale(0);
          }
          40% {
            transform: scale(1);
          }
        }
        
        .carbot-branding {
          text-align: center;
          padding: 8px;
          font-size: 11px;
          color: #64748b;
          border-top: 1px solid #e2e8f0;
        }
        
        .carbot-branding a {
          color: ${config.theme.primaryColor};
          text-decoration: none;
        }

        @media (max-width: 480px) {
          .carbot-chat-window {
            width: calc(100vw - 40px);
            height: calc(100vh - 100px);
            max-width: 350px;
            max-height: 500px;
          }
        }
      </style>
      
      <button class="carbot-launcher" id="carbot-launcher">
        ${config.theme.logoUrl ? 
          `<img src="${config.theme.logoUrl}" alt="Logo" style="width: 32px; height: 32px; border-radius: 4px;">` :
          `<svg viewBox="0 0 24 24" style="width: 24px; height: 24px; fill: white;">
            <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.22.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/>
          </svg>`
        }
      </button>
      
      <div class="carbot-chat-window" id="carbot-chat-window">
        <div class="carbot-header">
          <h3>Chat Support</h3>
          <button class="carbot-close" id="carbot-close">×</button>
        </div>
        
        <div class="carbot-messages" id="carbot-messages">
          <div class="carbot-message bot">${config.settings.welcomeMessage}</div>
        </div>
        
        <div class="carbot-input-area">
          <input type="text" class="carbot-input" id="carbot-input" placeholder="Schreiben Sie eine Nachricht...">
          <button class="carbot-send" id="carbot-send">Senden</button>
        </div>
        
        ${config.settings.showBranding ? '<div class="carbot-branding">Powered by <a href="https://carbot.chat" target="_blank">CarBot</a></div>' : ''}
      </div>
    `;

    document.body.appendChild(widgetContainer);
    
    // Event listeners
    document.getElementById('carbot-launcher').addEventListener('click', toggleChat);
    document.getElementById('carbot-close').addEventListener('click', closeChat);
    document.getElementById('carbot-send').addEventListener('click', sendMessage);
    document.getElementById('carbot-input').addEventListener('keypress', function(e) {
      if (e.key === 'Enter') sendMessage();
    });

    // Auto-open if configured
    if (config.settings.autoOpen) {
      setTimeout(openChat, 2000);
    }
  }

  function toggleChat() {
    if (isOpen) {
      closeChat();
    } else {
      openChat();
    }
  }

  function openChat() {
    isOpen = true;
    document.getElementById('carbot-chat-window').classList.add('open');
    document.getElementById('carbot-input').focus();
  }

  function closeChat() {
    isOpen = false;
    document.getElementById('carbot-chat-window').classList.remove('open');
  }

  function addMessage(message, isUser = false) {
    const messagesContainer = document.getElementById('carbot-messages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `carbot-message ${isUser ? 'user' : 'bot'}`;
    messageDiv.textContent = message;
    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  function showTyping() {
    const messagesContainer = document.getElementById('carbot-messages');
    const typingDiv = document.createElement('div');
    typingDiv.className = 'carbot-typing';
    typingDiv.id = 'carbot-typing';
    typingDiv.innerHTML = '<span></span><span></span><span></span>';
    messagesContainer.appendChild(typingDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  function hideTyping() {
    const typingDiv = document.getElementById('carbot-typing');
    if (typingDiv) {
      typingDiv.remove();
    }
  }

  async function sendMessage() {
    const input = document.getElementById('carbot-input');
    const message = input.value.trim();
    
    if (!message) return;

    // Add user message
    addMessage(message, true);
    input.value = '';

    // Show typing indicator
    showTyping();

    try {
      const response = await fetch(`${config.baseUrl}/widget-chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-widget-key': config.apiKey
        },
        body: JSON.stringify({
          message,
          sessionId,
          visitorData
        })
      });

      const data = await response.json();
      
      hideTyping();
      
      if (response.ok) {
        addMessage(data.response);
        
        // Check if we need to collect contact info
        if ((data.collect_email || data.collect_phone) && !visitorData.email && !visitorData.phone) {
          setTimeout(() => {
            collectContactInfo();
          }, 1000);
        }
      } else {
        addMessage('Entschuldigung, es gab ein Problem. Bitte versuchen Sie es später erneut.');
      }
    } catch (error) {
      // Handle API request errors gracefully
      const errorMessage = error instanceof Error ? error.message : 'Connection error';
      hideTyping();
      addMessage('Entschuldigung, es gab ein Verbindungsproblem. Bitte versuchen Sie es später erneut.');
    }
  }

  function collectContactInfo() {
    if (config.settings.collectEmail && !visitorData.email) {
      const email = prompt('Möchten Sie uns Ihre E-Mail-Adresse hinterlassen, damit wir uns bei Ihnen melden können?');
      if (email && email.includes('@')) {
        visitorData.email = email;
        addMessage('Vielen Dank! Wir haben Ihre E-Mail-Adresse gespeichert und melden uns bei Ihnen.');
      }
    }
    
    if (config.settings.collectPhone && !visitorData.phone) {
      const phone = prompt('Möchten Sie uns auch Ihre Telefonnummer hinterlassen?');
      if (phone) {
        visitorData.phone = phone;
        addMessage('Perfekt! Wir haben auch Ihre Telefonnummer gespeichert.');
      }
    }
  }

  // Initialize widget when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createWidget);
  } else {
    createWidget();
  }

  // Expose API for manual control
  window.CarBot = {
    open: openChat,
    close: closeChat,
    toggle: toggleChat,
    sendMessage: function(text) {
      const input = document.getElementById('carbot-input');
      if (input) {
        input.value = text;
        sendMessage();
      }
    }
  };

})();