'use client';

/**
 * AI Chat Panel - Floating draggable chat interface
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { useAIChat } from '@/hooks/use-ai-chat';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  MessageSquare, 
  X, 
  Send, 
  Loader2, 
  Trash2,
  Bot,
  User,
  GripVertical
} from 'lucide-react';

interface Position {
  x: number;
  y: number;
}

interface AIChatPanelProps {
  projectId?: string;
  className?: string;
}

const STORAGE_KEY = 'ceoclaw-chat-position';
const BUTTON_SIZE = 56; // h-14 w-14 = 56px
const DEFAULT_POSITION: Position = { x: 24, y: 24 }; // bottom-6 right-6 = 24px

// Public pages where AI chat should NOT appear
const PUBLIC_PATHS = ['/login', '/signup', '/forgot-password', '/reset-password'];

export function AIChatPanel({ projectId, className }: AIChatPanelProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [position, setPosition] = useState<Position>(DEFAULT_POSITION);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState<Position>({ x: 0, y: 0 });
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const { messages, isLoading, error, sendMessage, clearMessages } = useAIChat({
    projectId,
  });

  // Hide on public pages
  if (PUBLIC_PATHS.some(path => pathname?.startsWith(path))) {
    return null;
  }

  // Load position from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setPosition(parsed);
      }
    } catch (e) {
      // Ignore errors
    }
  }, []);

  // Save position to localStorage
  const savePosition = useCallback((pos: Position) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(pos));
    } catch (e) {
      // Ignore errors
    }
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Drag handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!buttonRef.current) return;
    
    e.preventDefault();
    const rect = buttonRef.current.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
    setIsDragging(true);
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return;
    
    const newX = window.innerWidth - e.clientX + dragOffset.x - BUTTON_SIZE;
    const newY = window.innerHeight - e.clientY + dragOffset.y - BUTTON_SIZE;
    
    // Clamp to screen bounds
    const clampedX = Math.max(0, Math.min(newX, window.innerWidth - BUTTON_SIZE));
    const clampedY = Math.max(0, Math.min(newY, window.innerHeight - BUTTON_SIZE));
    
    setPosition({ x: clampedX, y: clampedY });
  }, [isDragging, dragOffset]);

  const handleMouseUp = useCallback(() => {
    if (isDragging) {
      setIsDragging(false);
      savePosition(position);
    }
  }, [isDragging, position, savePosition]);

  // Global mouse events
  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const message = input;
    setInput('');
    await sendMessage(message);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleButtonClick = () => {
    if (!isDragging) {
      setIsOpen(true);
    }
  };

  if (!isOpen) {
    return (
      <Button
        ref={buttonRef}
        onMouseDown={handleMouseDown}
        onClick={handleButtonClick}
        className={`fixed h-14 w-14 rounded-full shadow-lg ${
          isDragging ? 'cursor-grabbing' : 'cursor-grab'
        } ${className}`}
        style={{
          right: `${position.x}px`,
          bottom: `${position.y}px`,
        }}
        size="icon"
      >
        <MessageSquare className="h-6 w-6" />
      </Button>
    );
  }

  return (
    <Card className={`fixed w-96 h-[500px] flex flex-col shadow-xl z-50 ${className}`}
      style={{
        right: `${position.x}px`,
        bottom: `${position.y}px`,
      }}
    >
      {/* Header */}
      <CardHeader className="flex-row items-center justify-between space-y-0 pb-3 border-b cursor-move"
        onMouseDown={(e) => {
          e.preventDefault();
          const card = e.currentTarget.closest('.fixed') as HTMLElement;
          if (!card) return;
          const rect = card.getBoundingClientRect();
          setDragOffset({
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
          });
          setIsDragging(true);
        }}
      >
        <div className="flex items-center gap-2">
          <GripVertical className="h-4 w-4 text-muted-foreground" />
          <Bot className="h-5 w-5 text-blue-500" />
          <CardTitle className="text-base">CEOClaw AI</CardTitle>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={clearMessages}
            title="Очистить чат"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsOpen(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      {/* Messages */}
      <CardContent className="flex-1 overflow-y-auto p-3 space-y-3">
        {messages.length === 0 && (
          <div className="text-center text-sm text-muted-foreground py-8">
            <Bot className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
            <p>Привет! Я CEOClaw AI.</p>
            <p className="text-xs mt-1">Задайте вопрос о ваших проектах.</p>
          </div>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.role === 'assistant' && (
              <div className="flex-shrink-0 w-7 h-7 rounded-full bg-blue-500 flex items-center justify-center">
                <Bot className="h-4 w-4 text-white" />
              </div>
            )}
            <div
              className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
                msg.role === 'user'
                  ? 'bg-blue-500 text-white'
                  : 'bg-muted'
              }`}
            >
              {msg.content}
            </div>
            {msg.role === 'user' && (
              <div className="flex-shrink-0 w-7 h-7 rounded-full bg-gray-500 flex items-center justify-center">
                <User className="h-4 w-4 text-white" />
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Думаю...</span>
          </div>
        )}

        {error && (
          <div className="text-sm text-red-500 bg-red-50 rounded p-2">
            {error}
          </div>
        )}

        <div ref={messagesEndRef} />
      </CardContent>

      {/* Input */}
      <div className="p-3 border-t">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Введите сообщение..."
            disabled={isLoading}
            className="flex-1"
          />
          <Button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            size="icon"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </Card>
  );
}
