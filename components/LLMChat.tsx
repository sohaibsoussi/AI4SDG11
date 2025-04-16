'use client';

import { useState } from "react";
import axios from "axios";
import ReactMarkdown from "react-markdown";

export type ChatMessage = { role: "user" | "assistant" | "system"; content: string };

type LLMChatProps = {
  // Dynamic context info (e.g., route details, weather etc.) to be merged with static transportation context
  context?: string;
};

export default function LLMChat({ context }: LLMChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");

  const handleSend = async () => {
    if (!input.trim()) return;
    
    // Append user message to conversation history
    const newMessages: ChatMessage[] = [
      ...messages,
      { role: "user", content: input }
    ];
    setMessages(newMessages);

    try {
      // Call your Groq API endpoint with messages and dynamic context
      const { data } = await axios.post("/api/groq/chat", {
        messages: newMessages,
        context: context || "",
      });
      setMessages([
        ...newMessages,
        { role: "assistant", content: data.response }
      ]);
    } catch (error) {
      console.error("LLM Chat error:", error);
      setMessages([
        ...newMessages,
        { role: "assistant", content: "Error: Unable to fetch response." }
      ]);
    }
    setInput("");
  };

  return (
    <div className="flex flex-col h-full border border-gray-300 rounded-lg p-4 bg-white shadow">
      <h2 className="text-xl font-semibold mb-3">Chat with SLTVerse Assistant</h2>
      <div className="flex-1 overflow-y-auto space-y-2 mb-4">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`p-2 rounded-md ${
              msg.role === "user" ? "bg-blue-50 text-right" : "bg-gray-100 text-left"
            }`}
          >
            {msg.role === "assistant" ? (
              <ReactMarkdown>{msg.content}</ReactMarkdown>
            ) : (
              msg.content
            )}
          </div>
        ))}
      </div>
      <div className="flex">
        <input
          type="text"
          className="flex-1 border border-gray-300 rounded-l-md px-3 py-2 focus:outline-none"
          placeholder="Ask your question..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSend();
          }}
        />
        <button onClick={handleSend} className="bg-blue-600 text-white rounded-r-md px-4 py-2">
          Send
        </button>
      </div>
    </div>
  );
}