import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Send, Stethoscope, Calendar, Pill, MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";
import MobileLayout from "@/components/MobileLayout";
import MobileHeader from "@/components/MobileHeader";

const AIChatbotPage = () => {
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Hi! I'm your AI health assistant. How can I help you today?" }
  ]);
  const [input, setInput] = useState("");
  const navigate = useNavigate();

  const quickPrompts = [
    { text: "Check Symptoms", icon: <Stethoscope className="h-4 w-4" /> },
    { text: "Book Appointment", icon: <Calendar className="h-4 w-4" /> },
    { text: "Medicine Info", icon: <Pill className="h-4 w-4" /> },
    { text: "Find Hospital", icon: <MapPin className="h-4 w-4" /> }
  ];

  const sendMessage = () => {
    if (!input.trim()) return;

    setMessages([...messages, { role: "user", content: input }]);
    setInput("");

    // Simulate AI response
    setTimeout(() => {
      setMessages(prev => [...prev, {
        role: "assistant",
        content: "I understand you need help with that. Let me assist you with your health concerns."
      }]);
    }, 1000);
  };

  const selectPrompt = (prompt: string) => {
    setInput(prompt);
  };

  return (
    <MobileLayout showNavigation={true} className="bg-gradient-app-bg">
      <MobileHeader
        title="AI Chatbot"
        showBack={true}
        showNotifications={false}
      />

      <div className="flex flex-col h-[calc(100vh-8rem)]">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[80%] p-3 rounded-2xl ${msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                <p className="text-sm">{msg.content}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Prompts */}
        <div className="p-4 border-t bg-background">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {quickPrompts.map((prompt, idx) => (
              <Badge
                key={idx}
                variant="outline"
                className="cursor-pointer whitespace-nowrap flex items-center gap-1 px-3 py-2"
                onClick={() => selectPrompt(prompt.text)}
              >
                {prompt.icon}
                {prompt.text}
              </Badge>
            ))}
          </div>
        </div>

        {/* Input */}
        <div className="p-4 border-t bg-background">
          <div className="flex gap-2">
            <Input
              placeholder="Type your message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && sendMessage()}
            />
            <Button size="icon" onClick={sendMessage}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </MobileLayout>
  );
};

export default AIChatbotPage;
