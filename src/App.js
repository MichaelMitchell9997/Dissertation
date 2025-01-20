import React, { useState } from 'react';
import './App.css';

function App() {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);

  const handleSendMessage = async () => {
    if (message) {
      setMessages([...messages, { text: message, type: 'user' }]);
      setMessage('');

      // Send the message to the LLM server
      try {
        const response = await fetch('http://127.0.0.1:1234/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: "llama-3.2-1b-instruct",
            messages: [
              { role: "system", content: "Always answer in rhymes. Today is Thursday" },
              { role: "user", content: message },
            ],
            temperature: 0.7,
            max_tokens: -1,
            stream: false,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          setMessages((prevMessages) => [...prevMessages, { text: data.choices[0].message.content, type: 'llm' }]);
        } else {
          console.error('Error from LLM server:', response.statusText);
        }
      } catch (error) {
        console.error('Failed to send message to LLM server:', error);
      }
    }
  };

  const handleChange = (event) => {
    setMessage(event.target.value);
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setMessages([...messages, { text: `Uploaded: ${file.name}`, type: 'user' }]);
    }
  };

  return (
    <div className="App">
      <h1>Form Assistant</h1>
      <div className="chat-container">
        <div className="message-container">
          {messages.map((msg, index) => (
            <div key={index} className={msg.type === 'user' ? 'user-message' : 'LLM-message'}>
              {msg.text}
            </div>
          ))}
        </div>
        <div className="input-container">
          <input
            type="text"
            value={message}
            onChange={handleChange}
            placeholder="Type a message"
            onKeyDown={(event) => {
              if (event.keyCode === 13) {
                handleSendMessage();
              }
            }}
          />
          <button onClick={handleSendMessage}>Send</button>
          <label className="upload-label">
            Upload
            <input
              type="file"
              className="file-upload"
              onChange={handleFileUpload}
            />
          </label>
        </div>
      </div>
    </div>
  );
}

export default App;
