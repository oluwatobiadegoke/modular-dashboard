'use client';
import React, { useState, FormEvent, useRef, useEffect } from 'react';
import { Button } from '@repo/ui/button';

const mockApi = (message: string): Promise<string> => {
  const normalizedMsg = message.toLowerCase();
  let response =
    "I'm not sure how to respond to that. Try asking about 'analytics' or 'log'.";

  if (normalizedMsg.includes('hello') || normalizedMsg.includes('hi')) {
    response = 'Hello! How can I help you with your dashboard today?';
  } else if (normalizedMsg.includes('analytics')) {
    response =
      "The Analytics widget shows key metrics. I will now emit an 'ai:insight' event for the log to capture.";
  } else if (normalizedMsg.includes('log')) {
    response =
      'The Real-time Log widget listens for events from other widgets. You just saw it react to an analytics refresh.';
  }

  return new Promise((resolve) => setTimeout(() => resolve(response), 1000));
};

interface Message {
  sender: 'user' | 'ai' | 'system';
  text: string;
}

interface EventData {
  message: string;
  timestamp: number;
}

interface WidgetProps {
  eventBus: {
    emit: (event: string, ...args: any[]) => void;
    on: (e: string, cb: (d: EventData) => void) => void;
    off: (e: string, cb: (d: EventData) => void) => void;
  };
}

const Widget = ({ eventBus }: WidgetProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  useEffect(() => {
    const handleAnalyticsEvent = (data: EventData) => {
      const systemMessage: Message = {
        sender: 'system',
        text: `I noticed the analytics data was refreshed. New message: "${data.message}"`,
      };
      setMessages((prev) => [...prev, systemMessage]);
    };

    eventBus.on('analytics:broadcast', handleAnalyticsEvent);
    return () => {
      eventBus.off('analytics:broadcast', handleAnalyticsEvent);
    };
  }, [eventBus]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = { sender: 'user', text: inputValue };
    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    const aiResponseText = await mockApi(inputValue);
    const aiMessage: Message = { sender: 'ai', text: aiResponseText };
    setMessages((prev) => [...prev, aiMessage]);

    if (aiResponseText.includes('ai:insight')) {
      const eventData = {
        message: `AI provided insight about the Analytics widget.`,
        timestamp: Date.now(),
      };
      eventBus.emit('ai:insight', eventData);
    }

    setIsLoading(false);
  };

  return (
    <div className='flex flex-col h-[220px]'>
      <div className='flex-grow overflow-y-auto mb-4 pr-2 space-y-3'>
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex ${
              msg.sender === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`max-w-[80%] text-sm rounded-lg px-3 py-2 ${
                msg.sender === 'user'
                  ? 'bg-blue-500 text-white'
                  : msg.sender === 'ai'
                  ? 'bg-gray-200 text-gray-800'
                  : 'bg-purple-100 text-purple-700 w-full text-center italic'
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className='flex justify-start'>
            <p className='max-w-[80%] text-sm rounded-lg px-3 py-2 bg-gray-200 text-gray-800 italic'>
              Thinking...
            </p>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSubmit} className='flex gap-2'>
        <input
          type='text'
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder='Ask about widgets...'
          disabled={isLoading}
          className='flex-grow p-2 border rounded-md text-sm focus:ring-2 focus:ring-blue-500'
        />
        <Button type='submit' disabled={isLoading}>
          Send
        </Button>
      </form>
    </div>
  );
};

export default Widget;
