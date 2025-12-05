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
import { GlobeIcon, MicIcon } from 'lucide-react';
import { useState } from 'react';
import { useChat } from '@ai-sdk/react';
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from '@/components/ai-elements/conversation';
import { Message, MessageContent, MessageResponse } from '@/components/ai-elements/message';
import { Response } from '@/components/ai-elements/response';
import type { ToolUIPart } from 'ai';
import {
  Tool,
  ToolHeader,
  ToolInput,
  ToolOutput,
  ToolContent
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

  const { messages, status, sendMessage } = useChat();

  const handleSubmit = (message: PromptInputMessage) => {
    sendMessage(
      { text: message.text },
      {
        body: {
          model: model,
        },
      },
    );
    setText('');
  };

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
                        <MessageResponse key={`${message.id}-${i}`}>
                          {part.text}
                        </MessageResponse>
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
                                    {`\`\`\`json\n${JSON.stringify(toolPart.output, null, 2)}\n\`\`\``}
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
            <PromptInputBody>
                <PromptInputTextarea
                    onChange={(e) => setText(e.target.value)}
                    value={text}
                    className=''
                />
            </PromptInputBody>
            <PromptInputFooter>
                <PromptInputTools>
                <PromptInputButton>
                    <MicIcon size={16} />
                </PromptInputButton>
                <PromptInputButton>
                    <GlobeIcon size={16} />
                    <span>Search</span>
                </PromptInputButton>
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