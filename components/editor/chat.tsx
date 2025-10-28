'use client';

import {
  PromptInput,
  PromptInputButton,
  PromptInputModelSelect,
  PromptInputModelSelectContent,
  PromptInputModelSelectItem,
  PromptInputModelSelectTrigger,
  PromptInputModelSelectValue,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputToolbar,
  PromptInputTools,
} from '@/components/ai-elements/prompt-input';
import { GlobeIcon, MicIcon } from 'lucide-react';
import { useState } from 'react';
import { useChat } from '@ai-sdk/react';
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from '@/components/ai-elements/conversation';
import { Message, MessageContent } from '@/components/ai-elements/message';
import { Response } from '@/components/ai-elements/response';
import type { ToolUIPart } from 'ai';
import {
  Tool,
  ToolContent,
  ToolHeader,
  ToolInput,
  ToolOutput,
} from '@/components/ai-elements/tool';
import { CodeBlock } from '@/components/ai-elements/code-block';
import { TabsList, TabsTrigger } from '../ui/tabs';
import { Button } from '../ui/button';

const models = [
  { id: 'gpt-4o-mini', name: 'GPT-4o-Mini' },
];

const Chat = () => {
  const [text, setText] = useState<string>('');
  const [model, setModel] = useState<string>(models[0].id);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    sendMessage(
      { text: text },
      {
        body: {
          model: model,
        },
      },
    );
    setText('');
  };

  const { messages, status, sendMessage } = useChat();

  return (
    <div className="h-[calc(100vh-5rem)] bg-card rounded-lg">
        <div className="flex-shrink-0 border-b border-border p-2 dark:bg-[#333333]">
          <Button variant="ghost" size="sm" className="flex items-center gap-1 px-2">
            <span className="bg-primary/10 text-primary rounded px-2 py-1 text-xs font-medium">
              AI Assistant
            </span>
          </Button>
        </div>
      <div className="flex flex-col h-[calc(100vh-8.5rem)]">
        <Conversation>
          <ConversationContent>
            {messages.map((message) => (
              <Message from={message.role} key={message.id}>
                <MessageContent>
                  {message.parts.map((part, i) => {
                    if (part.type === 'text') {
                      return (
                        <Response key={`${message.id}-${i}`}>
                          {part.text}
                        </Response>
                      );
                    } else if (part.type.startsWith('tool-')) {
                      const toolPart = part as ToolUIPart;
                      return (
                        <Tool key={`${message.id}-${i}`} defaultOpen={true}>
                          <ToolHeader type={toolPart.type} state={toolPart.state} />
                          {/* <ToolContent>
                            <ToolInput input={toolPart.input} />
                            <ToolOutput
                              output={
                                toolPart.output ? (
                                  <Response>
                                    {JSON.stringify(toolPart.output, null, 2)}
                                  </Response>
                                ) : null
                              }
                              errorText={toolPart.errorText}
                            />
                          </ToolContent> */}
                        </Tool>
                      );
                    } else {
                      return null;
                    }
                  })}
                </MessageContent>
              </Message>
            ))}
          </ConversationContent>
          <ConversationScrollButton />
        </Conversation>

        <div className='mx-2 mb-2'>
            <PromptInput onSubmit={handleSubmit} className="border-border">
            <PromptInputTextarea
                onChange={(e) => setText(e.target.value)}
                value={text}
                className=''
            />
            <PromptInputToolbar>
                <PromptInputTools>
                <PromptInputButton>
                    <MicIcon size={16} />
                </PromptInputButton>
                <PromptInputButton>
                    <GlobeIcon size={16} />
                    <span>Search</span>
                </PromptInputButton>
                <PromptInputModelSelect
                    onValueChange={(value) => {
                    setModel(value);
                    }}
                    value={model}
                >
                    <PromptInputModelSelectTrigger>
                    <PromptInputModelSelectValue />
                    </PromptInputModelSelectTrigger>
                    <PromptInputModelSelectContent>
                    {models.map((model) => (
                        <PromptInputModelSelectItem key={model.id} value={model.id}>
                        {model.name}
                        </PromptInputModelSelectItem>
                    ))}
                    </PromptInputModelSelectContent>
                </PromptInputModelSelect>
                </PromptInputTools>
                <PromptInputSubmit disabled={!text} status={status} />
            </PromptInputToolbar>
            </PromptInput>
        </div>

      </div>
    </div>
  );
};

export default Chat;