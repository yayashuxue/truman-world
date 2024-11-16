import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Send } from 'lucide-react';

interface ChatMessage {
  from: string;
  text: string;
}

interface GlobalChatProps {
  messages: ChatMessage[];
  onSendMessage: (message: string) => void;
}

export default function GlobalChat({ messages, onSendMessage }: GlobalChatProps) {
  const [inputMessage, setInputMessage] = useState('');

  const handleSend = () => {
    if (inputMessage.trim()) {
      onSendMessage(inputMessage);
      setInputMessage('');
    }
  };

  return (
    <div className="global-chat">
      <div className="chat-messages h-64 overflow-y-auto mb-4 border rounded-lg p-4">
        {messages.map((msg, idx) => (
          <div 
            key={idx} 
            className={`mb-2 ${msg.from === 'World AI' ? 'text-blue-600' : 'text-gray-800'}`}
          >
            <strong>{msg.from}:</strong> {msg.text}
          </div>
        ))}
      </div>
      <div className="chat-input flex gap-2">
        <Input
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Send a message to the World AI..."
          className="flex-1"
        />
        <Button onClick={handleSend}>
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
} 