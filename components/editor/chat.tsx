'use client';

import {
  PromptInput,
  PromptInputBody,
  PromptInputButton,
  PromptInputFooter,
  PromptInputSelect,
  PromptInputSelectContent,
  PromptInputSelectItem,
  PromptInputSelectTrigger,
  PromptInputSelectValue,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputTools,
  type PromptInputMessage,
} from '@/components/ai-elements/prompt-input';
import { HelpCircle, Lightbulb, Bug, Zap, Plus, History, ChevronDown, Trash2 } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { useChat } from '@ai-sdk/react';
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from '@/components/ai-elements/conversation';
import { Message, MessageContent, MessageResponse } from '@/components/ai-elements/message';
import type { ToolUIPart } from 'ai';
import {
  Tool,
  ToolHeader,
} from '@/components/ai-elements/tool';
import { Button } from '../ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useEditorStore } from '@/lib/stores/editor-store';
import useUser from '@/hooks/use-user';
import { getUserConversations, getMessagesByConversationId, deleteChat, type Conversation as ConversationType } from '@/actions/chat';
import { fetchMessages, convertToUIMessages } from '@/lib/supabase/queries/messages';

const models = [
  { id: 'gpt-4o-mini', name: 'GPT-4o-Mini' },
];

const Chat = () => {
  const [text, setText] = useState<string>('');
  const [model, setModel] = useState<string>(models[0].id);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [conversations, setConversations] = useState<ConversationType[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [pendingMessages, setPendingMessages] = useState<any[] | null>(null);
  
  const { getEditorContext, currentProblem, output } = useEditorStore();
  const { data: user } = useUser();

  const { messages, status, sendMessage, setMessages } = useChat({
    id: conversationId || undefined,
  });

  // Effect to set messages AFTER conversationId change has taken effect
  useEffect(() => {
    if (pendingMessages !== null && conversationId) {
      setMessages(pendingMessages);
      setPendingMessages(null);
      setIsLoadingHistory(false);
    }
  }, [conversationId, pendingMessages, setMessages]);

  // Load user's conversations on mount
  useEffect(() => {
    const loadConversations = async () => {
      if (user?.id) {
        try {
          const convs = await getUserConversations(user.id);
          setConversations(convs);
        } catch (error) {
          console.error('Error loading conversations:', error);
        }
      }
    };
    loadConversations();
  }, [user?.id]);

  // Load messages when conversationId changes
  const loadConversation = useCallback(async (convId: string) => {
    setIsLoadingHistory(true);
    
    try {
      const dbMessages = await fetchMessages(convId);
      const uiMessages = convertToUIMessages(dbMessages);
      
      // Store messages to be set after conversationId updates
      setPendingMessages(uiMessages);
      // Change conversationId - this will trigger useChat to switch contexts
      setConversationId(convId);
      // The useEffect above will set the messages after the id change takes effect
    } catch (error) {
      console.error('Error loading conversation:', error);
      setIsLoadingHistory(false);
    }
  }, []);

  // Start a new conversation
  const startNewConversation = useCallback(() => {
    const newId = crypto.randomUUID();
    setConversationId(newId);
    setMessages([]);
  }, [setMessages]);

  // Delete a conversation
  const handleDeleteChat = useCallback(async (e: React.MouseEvent, chatId: string) => {
    e.stopPropagation(); // Prevent triggering the parent onClick
    
    try {
      const success = await deleteChat(chatId);
      if (success) {
        // Remove from local state
        setConversations(prev => prev.filter(c => c.id !== chatId));
        
        // If we deleted the current conversation, start a new one
        if (chatId === conversationId) {
          startNewConversation();
        }
      }
    } catch (error) {
      console.error('Error deleting chat:', error);
    }
  }, [conversationId, startNewConversation]);

  // Initialize conversation ID on first render
  useEffect(() => {
    if (!conversationId) {
      startNewConversation();
    }
  }, [conversationId, startNewConversation]);

  // Regular submit without context
  const handleSubmit = (message: PromptInputMessage) => {
    sendMessage(
      { text: message.text },
      {
        body: {
          model: model,
          conversationId,
          userId: user?.id,
        },
      },
    );
    setText('');
  };

  // Submit with editor context for help
  const handleHelpSubmit = (helpType: 'hint' | 'error' | 'optimize') => {
    const context = getEditorContext();
    
    let promptText = text.trim();
    
    // Add default prompts based on help type if no custom text
    if (!promptText) {
      switch (helpType) {
        case 'hint':
          promptText = "I'm stuck on this problem. Can you give me a hint without giving away the solution?";
          break;
        case 'error':
          promptText = "I'm getting an error. Can you explain what's wrong and how to fix it?";
          break;
        case 'optimize':
          promptText = "My solution works but I think it can be more efficient. Can you suggest optimizations?";
          break;
      }
    }

    sendMessage(
      { text: promptText },
      {
        body: {
          model: model,
          editorContext: context,
          conversationId,
          userId: user?.id,
        },
      },
    );
    setText('');
  };

  // Refresh conversations list after sending a message
  useEffect(() => {
    if (status === 'ready' && user?.id && messages.length > 0) {
      getUserConversations(user.id).then(setConversations).catch(console.error);
    }
  }, [status, user?.id, messages.length]);

  // Check if we have context to provide help
  const hasContext = currentProblem !== null;
  const hasError = output && (
    output.toLowerCase().includes('error') || 
    output.toLowerCase().includes('wrong') ||
    output.toLowerCase().includes('failed')
  );

  return (
    <div className="h-[calc(100vh-5rem)] bg-card rounded-lg flex flex-col">
      <div className="flex-shrink-0 border-b border-border p-2 dark:bg-[#333333]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            {/* Conversation selector dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="flex items-center gap-1 px-2">
                  <span className="bg-primary/10 text-primary rounded px-2 py-1 text-xs font-medium">
                    AI Assistant
                  </span>
                  <ChevronDown className="h-3 w-3 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                <DropdownMenuItem onClick={startNewConversation}>
                  <Plus className="h-4 w-4 mr-2" />
                  New Chat
                </DropdownMenuItem>
                {conversations.length > 0 && (
                  <>
                    <DropdownMenuSeparator />
                    <div className="px-2 py-1.5 text-xs text-muted-foreground flex items-center">
                      <History className="h-3 w-3 mr-1" />
                      Recent
                    </div>
                    {conversations.slice(0, 10).map((conv) => (
                      <DropdownMenuItem 
                        key={conv.id}
                        onClick={() => loadConversation(conv.id)}
                        className={`${conv.id === conversationId ? 'bg-accent' : ''} group`}
                      >
                        <span className="truncate flex-1">{conv.title}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 ml-2 hover:bg-destructive hover:text-destructive-foreground"
                          onClick={(e) => handleDeleteChat(e, conv.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </DropdownMenuItem>
                    ))}
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          
          {/* Quick help buttons */}
          <TooltipProvider delayDuration={200}>
            <div className="flex items-center gap-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 w-8 p-0"
                    disabled={!hasContext || status === 'streaming'}
                    onClick={() => handleHelpSubmit('hint')}
                  >
                    <Lightbulb className="h-4 w-4 text-yellow-500" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Get a hint</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className={`h-8 w-8 p-0 ${hasError ? 'animate-pulse' : ''}`}
                    disabled={!hasContext || status === 'streaming'}
                    onClick={() => handleHelpSubmit('error')}
                  >
                    <Bug className="h-4 w-4 text-red-500" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Explain error</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 w-8 p-0"
                    disabled={!hasContext || status === 'streaming'}
                    onClick={() => handleHelpSubmit('optimize')}
                  >
                    <Zap className="h-4 w-4 text-blue-500" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Suggest optimizations</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </TooltipProvider>
        </div>
      </div>

      <div className="flex flex-col flex-1 min-h-0">
        <Conversation>
          <ConversationContent>
            {isLoadingHistory ? (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              </div>
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center p-4 text-muted-foreground">
                <HelpCircle className="h-12 w-12 mb-4 opacity-50" />
                <p className="text-sm font-medium mb-2">Need help with a problem?</p>
                <p className="text-xs">
                  Use the buttons above to get hints, debug errors, or optimize your solution.
                </p>
                {!hasContext && (
                  <p className="text-xs mt-2 text-yellow-600 dark:text-yellow-400">
                    Open a problem to enable AI assistance.
                  </p>
                )}
              </div>
            ) : (
              messages.map((message) => (
                <Message from={message.role} key={message.id}>
                  <MessageContent>
                    {message.parts.map((part, i) => {
                      if (part.type === 'text') {
                        return (
                          <MessageResponse key={`${message.id}-${i}`}>
                            {part.text}
                          </MessageResponse>
                        );
                      } else if (part.type.startsWith('tool-')) {
                        const toolPart = part as ToolUIPart;
                        return (
                          <Tool key={`${message.id}-${i}`} defaultOpen={true}>
                            <ToolHeader type={toolPart.type} state={toolPart.state} />
                          </Tool>
                        );
                      } else {
                        return null;
                      }
                    })}
                  </MessageContent>
                </Message>
              ))
            )}
          </ConversationContent>
          <ConversationScrollButton />
        </Conversation>

        <div className='mx-2 mb-2'>
          <PromptInput onSubmit={handleSubmit} className="border-border">
            <PromptInputBody>
              <PromptInputTextarea
                onChange={(e) => setText(e.target.value)}
                value={text}
                placeholder={hasContext ? "Ask a question or use the help buttons above..." : "Ask me anything..."}
                className=''
              />
            </PromptInputBody>
            <PromptInputFooter>
              <PromptInputTools>
                {/* Help me button with context */}
                <TooltipProvider delayDuration={200}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <PromptInputButton
                        onClick={() => handleHelpSubmit('hint')}
                        disabled={!hasContext || !text.trim()}
                        className={hasContext && text.trim() ? 'text-primary' : ''}
                      >
                        <HelpCircle size={16} />
                        <span>Help me</span>
                      </PromptInputButton>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Send with code context</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <PromptInputSelect
                  onValueChange={(value) => {
                    setModel(value);
                  }}
                  value={model}
                >
                  <PromptInputSelectTrigger>
                    <PromptInputSelectValue />
                  </PromptInputSelectTrigger>
                  <PromptInputSelectContent>
                    {models.map((model) => (
                      <PromptInputSelectItem key={model.id} value={model.id}>
                        {model.name}
                      </PromptInputSelectItem>
                    ))}
                  </PromptInputSelectContent>
                </PromptInputSelect>
              </PromptInputTools>
              <PromptInputSubmit disabled={!text} status={status} />
            </PromptInputFooter>
          </PromptInput>
        </div>
      </div>
    </div>
  );
};

export default Chat;
