'use client';

import { useState } from "react";
import axios from "axios";

type ChatMessage = { role: "user" | "assistant", content: string };

export default function LLMChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");

  const handleSend = async () => {
    if (!input.trim()) return;

    // Append the user's message locally
    const newMessages = [...messages, { role: "user", content: input }];
    setMessages(newMessages);

    try {
      // Call your n8n endpoint to get a response.
      // Adjust the URL to match your n8n endpoint.
      const { data } = await axios.post("/api/n8n/chat", { message: input });
      // Append the response from n8n.
      setMessages([...newMessages, { role: "assistant", content: data.response }]);
    } catch (error) {
      console.error(error);
      setMessages([...newMessages, { role: "assistant", content: "Error: Unable to fetch response" }]);
    }
    setInput("");
  };

  return (
    <div className="flex flex-col h-full border border-gray-300 rounded-lg p-4 bg-white shadow">
      <h2 className="text-xl text-black font-semibold mb-3">Assistant</h2>
      <div className="flex-1 overflow-y-auto space-y-2 mb-4">
        {messages.map((msg, idx) => (
          <div key={idx} className={`p-2 rounded-md ${msg.role === "user" ? "bg-blue-50 text-right" : "bg-gray-100 text-left"}`}>
            {msg.content}
          </div>
        ))}
      </div>
      <div className="flex">
        <input
          type="text"
          className="flex-1 border border-gray-300 rounded-l-md px-3 py-2 focus:outline-none"
          placeholder="Ask something..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") handleSend(); }}
        />
        <button onClick={handleSend} className="bg-blue-600 text-white rounded-r-md px-4 py-2">
          Send
        </button>
      </div>
    </div>
  );
}
