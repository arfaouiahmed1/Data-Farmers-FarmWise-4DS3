'use client';
import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Paper,
  TextInput,
  ActionIcon,
  Group,
  Stack,
  Avatar,
  Text,
  ScrollArea,
  Box,
  Button,
  Loader,
  rem,
  useMantineTheme
} from '@mantine/core';
import { IconSend, IconBrain, IconUser, IconMicrophone, IconSparkles } from '@tabler/icons-react';
import dayjs from 'dayjs';
import classes from './AiChatInterface.module.css'; // We'll create this CSS module

// Re-define needed interfaces and types here
interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: number;
}

const samplePrompts = [
  "What are the signs of nitrogen deficiency in corn?",
  "Suggest a crop rotation plan for Field C.",
  "When is the optimal planting time for tomatoes in my region?",
  // Add more relevant prompts if desired
];

// Mock response function (keep as is or refine)
const getMockResponse = (inputText: string): string => {
    const lowerInput = inputText.toLowerCase();
    if (lowerInput.includes('hello') || lowerInput.includes('hi')) {
        return "Hello there! How can I assist you with your farm today?";
    } else if (lowerInput.includes('nitrogen') && lowerInput.includes('corn')) {
        return "Nitrogen deficiency in corn often shows as yellowing in a V-shape on the lower leaves, starting from the tip.";
    } else if (lowerInput.includes('crop rotation')) {
        return "Certainly! To suggest a crop rotation plan, I need a bit more information. What crops have been grown in Field C previously, and what are your goals for the next few seasons (e.g., improving soil fertility, pest control)?";
    } else if (lowerInput.includes('soil health')) {
        return "Improving soil health organically involves practices like cover cropping, adding compost or manure, minimizing tillage, and promoting biodiversity.";
    } else if (lowerInput.includes('tomato') && lowerInput.includes('planting')) {
        return "Optimal tomato planting time depends heavily on your local climate and frost dates. Could you please provide your general location or USDA hardiness zone?";
    } else if (lowerInput.includes('tractor') || lowerInput.includes('maintenance')) {
        return "Okay, here's a general maintenance checklist for a tractor like the John Deere 8R:\n1. Check engine oil level.\n2. Inspect coolant level.\n3. Check hydraulic fluid level.\n4. Clean or replace air filters.\n5. Inspect tire pressure and condition.\n6. Check fuel level and filters.\n7. Lubricate grease points.\n8. Inspect belts and hoses.\n9. Check battery terminals.\n10. Test lights and indicators. Remember to consult the official manual for specifics.";
    } else {
        return "That's an interesting question! While I'm still learning, I can try my best. Could you perhaps rephrase or provide more details?";
    }
};

// Props interface including the new isFullScreen prop
interface AiChatInterfaceProps {
    isFullScreen?: boolean;
}

export function AiChatInterface({ isFullScreen = false }: AiChatInterfaceProps) { // Destructure prop with default
  const theme = useMantineTheme();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'initial',
      text: 'Welcome to the FarmWise AI Advisor! How can I help you today?',
      sender: 'ai',
      timestamp: Date.now(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isAiTyping, setIsAiTyping] = useState(false);
  const scrollAreaViewport = useRef<HTMLDivElement>(null);

  // Scroll to bottom logic (same as before)
  const scrollToBottom = useCallback(() => {
    scrollAreaViewport.current?.scrollTo({ top: scrollAreaViewport.current.scrollHeight, behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isAiTyping, scrollToBottom]);

  // Send message logic (same as before)
  const handleSend = (textToSend?: string) => {
    const messageText = textToSend || input.trim();
    if (!messageText || isAiTyping) return;

    const newUserMessage: Message = {
      id: Math.random().toString(36).substring(7),
      text: messageText,
      sender: 'user',
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, newUserMessage]);
    setInput('');
    setIsAiTyping(true);

    setTimeout(() => {
      const aiResponseText = getMockResponse(messageText);
      const newAiMessage: Message = {
        id: Math.random().toString(36).substring(7),
        text: aiResponseText,
        sender: 'ai',
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, newAiMessage]);
      setIsAiTyping(false);
    }, 1500 + Math.random() * 1000);
  };

  // Key press handler (same as before)
  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  return (
    // Apply a class based on fullscreen state if needed for specific styles
    <Paper 
        withBorder={false} 
        radius={isFullScreen ? 0 : "md"} // Match modal radius logic
        className={`${classes.chatContainer} ${isFullScreen ? classes.fullScreen : ''}`}
    >
      <ScrollArea className={classes.scrollArea} viewportRef={scrollAreaViewport}>
        <Stack gap="lg" p="md">
          {messages.map((message, index) => (
            <Group
              key={message.id}
              wrap="nowrap"
              gap="sm"
              align="flex-start"
              className={message.sender === 'user' ? classes.userMessageGroup : classes.aiMessageGroup}
            >
              {message.sender === 'ai' && (
                <Avatar radius="xl" color="violet">
                  <IconBrain size="1.2rem" />
                </Avatar>
              )}
              <Paper
                p="sm"
                radius="lg"
                withBorder={message.sender === 'user'} // Keep border for user like GH Copilot
                className={`${classes.messageBubble} ${message.sender === 'user' ? classes.userBubble : classes.aiBubble}`}
              >
                 <Text size="sm" style={{ whiteSpace: 'pre-wrap' }}>{message.text}</Text>
              </Paper>
               {message.sender === 'user' && (
                  <Avatar radius="xl" color="blue">
                      <IconUser size="1.2rem" />
                  </Avatar>
              )}
            </Group>
          ))}
          {isAiTyping && (
            <Group gap="sm" wrap="nowrap" className={classes.aiMessageGroup}>
               <Avatar radius="xl" color="violet">
                   <IconBrain size="1.2rem" />
               </Avatar>
               <Loader color="violet" type="dots" size="sm" />
            </Group>
          )}
        </Stack>
      </ScrollArea>

      <Box p="md" className={classes.inputArea}>
         {/* Suggested Prompts */} 
         {messages.length <= 3 && !isAiTyping && (
             <Group mb="sm" gap="xs">
               {samplePrompts.slice(0, 3).map((prompt) => (
                  <Button 
                      key={prompt}
                      size="xs" 
                      variant="outline"
                      color="gray"
                      onClick={() => handleSend(prompt)} 
                      leftSection={<IconSparkles size={14} />}
                  >
                     {prompt.length > 40 ? prompt.substring(0, 37) + '...' : prompt}
                  </Button>
              ))}
             </Group>
          )}
        <Group wrap="nowrap">
          <TextInput
            placeholder="Ask the AI Advisor anything..."
            value={input}
            onChange={(event) => setInput(event.currentTarget.value)}
            onKeyDown={handleKeyPress}
            disabled={isAiTyping}
            className={classes.textInput}
          />
          <ActionIcon 
              size={36} // Match input size more closely
              variant="filled" 
              color="blue" 
              onClick={() => handleSend()} 
              disabled={!input.trim() || isAiTyping}
              title="Send Message"
              radius="sm"
          >
            <IconSend size="1.1rem" />
          </ActionIcon>
        </Group>
      </Box>
    </Paper>
  );
} 