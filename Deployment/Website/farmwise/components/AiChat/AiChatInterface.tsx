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
  useMantineTheme,
  Menu,
  Divider,
  Tooltip,
  CopyButton,
  Badge,
  Popover,
  Drawer,
  Switch,
  Accordion,
  UnstyledButton,
  Collapse,
  Title,
  Kbd,
  Indicator
} from '@mantine/core';
import { 
  IconSend, 
  IconBrain, 
  IconUser, 
  IconMicrophone, 
  IconSparkles, 
  IconDotsVertical, 
  IconCopy, 
  IconTrash, 
  IconShare, 
  IconDownload, 
  IconCheck, 
  IconClock, 
  IconRefresh, 
  IconChevronDown, 
  IconSettings, 
  IconVocabulary, 
  IconInfoCircle, 
  IconLayoutGrid, 
  IconX, 
  IconChevronUp, 
  IconArrowUp
} from '@tabler/icons-react';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import classes from './AiChatInterface.module.css';

// Add dayjs plugins
dayjs.extend(relativeTime);

// Re-define needed interfaces and types here
interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: number;
  isExpanded?: boolean;
}

interface ChatHistory {
  role: string;
  parts: string[];
}

interface ChatSettings {
  showTimestamps: boolean;
  compactMode: boolean;
  useDarkTheme?: boolean;
}

const samplePrompts = [
  "How do I treat blight on my tomato plants?",
  "What's the best way to get rid of crabgrass?",
  "Suggest some organic treatments for powdery mildew on squash.",
  "My corn looks yellow, what could be wrong?",
  "Tell me about crop rotation for soil health.",
  "What are common signs of pest attacks on apple trees?",
];

// Props interface including the new isFullScreen prop
interface AiChatInterfaceProps {
    isFullScreen?: boolean;
}

// Function to format chat timestamps
const formatTimestamp = (timestamp: number, showRelative: boolean = true): string => {
  if (showRelative) {
    return dayjs(timestamp).fromNow();
  }
  return dayjs(timestamp).format('h:mm A');
};

// Function to make AI responses more conversational by removing formulaic text
const transformAiResponse = (text: string): string => {
  if (!text) return text;
  
  // Extract code blocks first to preserve them
  const codeBlocks: string[] = [];
  let preservedText = text.replace(/```([\s\S]*?)```/g, (match) => {
    codeBlocks.push(match);
    return `__CODE_BLOCK_${codeBlocks.length - 1}__`;
  });
  
  // Remove formulaic beginnings
  let transformed = preservedText
    // Remove "Here's some helpful information about..." pattern
    .replace(/^Here's some helpful information about ['"]?([^:'"]*?)['"]?:\s*/i, '')
    .replace(/^Here's what I know about ['"]?([^:'"]*?)['"]?:\s*/i, '')
    .replace(/^Based on my information about ['"]?([^:'"]*?)['"]?:\s*/i, '')
    .replace(/^For ['"]?([^:'"]*?)['"]?, here's what I'd recommend:\s*/i, '')
    .replace(/^Regarding ['"]?([^:'"]*?)['"]?, I have these suggestions:\s*/i, '')
    .replace(/^Information about ([^:]*?):\s*/i, '')
    // Remove other common formulaic phrases
    .replace(/^(Here are|Here is) some/i, 'Some')
    .replace(/^I hope this addresses your question\.\s*/i, '')
    .replace(/^This should address the core of your question\.\s*/i, '')
    .trim();
  
  // If the response still starts with a newline and information structure, clean it up
  if (transformed.startsWith('\n\n')) {
    transformed = transformed.replace(/^\n\n/, '');
  }
  
  // Remove "For Cherry (including sour) - Powdery mildew:" pattern
  transformed = transformed.replace(/^For ([^-]*?) - ([^:]*?):\s*/gm, '');
  
  // Convert markdown-style formatting to styled text
  // Bold text
  transformed = transformed.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  // Section headers with proper styling
  transformed = transformed.replace(/\*\s+([^*\n]+):/g, '<strong>$1:</strong>');
  
  // Clean up bullet points for better readability
  transformed = transformed.replace(/\n\s*•\s*/g, '\n• ');
  transformed = transformed.replace(/\n\s*\*\s*/g, '\n• ');
  transformed = transformed.replace(/\n\s*-\s*/g, '\n• ');
  
  // Add a more conversational opener if the response was heavily modified
  if (transformed !== preservedText && !transformed.match(/^(hi|hey|hello|sure|absolutely|yes|no|for|<)/i)) {
    const conversationalStarters = [
      "",
      "For this issue, ",
      "Here's the deal: ",
      "Quick answer: ",
      "The solution is to "
    ];
    const starterIndex = Math.floor(Date.now() / 1000) % conversationalStarters.length;
    transformed = conversationalStarters[starterIndex] + transformed;
  }
  
  // Restore code blocks
  transformed = transformed.replace(/__CODE_BLOCK_(\d+)__/g, (_, index) => {
    return codeBlocks[parseInt(index)];
  });
  
  return transformed;
};

export function AiChatInterface({ isFullScreen = false }: AiChatInterfaceProps) {
  const theme = useMantineTheme();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'initial',
      text: "Hey there! I'm your FarmWise AI Advisor. Got questions about weeds, crop diseases, or just need some farming tips? I'm here to help! What's on your mind today?",
      sender: 'ai',
      timestamp: Date.now(),
      isExpanded: true,
    },
  ]);
  const [input, setInput] = useState('');
  const [isAiTyping, setIsAiTyping] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatHistory[]>([]);
  const [sessionId, setSessionId] = useState<string>(() => {
    // Try to get existing session ID from localStorage or create a new one
    const savedSessionId = typeof window !== 'undefined' ? localStorage.getItem('farmwise_chat_session_id') : null;
    const newSessionId = savedSessionId || `session_${Math.random().toString(36).substring(2, 15)}`;
    if (typeof window !== 'undefined') {
      localStorage.setItem('farmwise_chat_session_id', newSessionId);
    }
    return newSessionId;
  });
  const scrollAreaViewport = useRef<HTMLDivElement>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [scrollToBottomVisible, setScrollToBottomVisible] = useState(false);
  
  // Chat settings
  const [settings, setSettings] = useState<ChatSettings>({
    showTimestamps: true,
    compactMode: false,
  });

  // Record refs to maintain even when component re-renders
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  
  // Track the last discussed topic for better follow-up handling
  const [lastTopic, setLastTopic] = useState<string | null>(null);
  
  // Scroll to bottom logic
  const scrollToBottom = useCallback(() => {
    if (!scrollAreaViewport.current) return;
    
    const scrollElement = scrollAreaViewport.current;
    const { scrollHeight, clientHeight, scrollTop } = scrollElement;
    
    scrollElement.scrollTo({ 
      top: scrollHeight, 
      behavior: 'smooth' 
    });
  }, []);

  // Handle scroll events to show/hide scroll to bottom button
  const handleScroll = useCallback(() => {
    if (!scrollAreaViewport.current) return;
    
    const { scrollHeight, clientHeight, scrollTop } = scrollAreaViewport.current;
    const scrollThreshold = 300; // Show button when scroll position is this many pixels from bottom
    
    setScrollToBottomVisible(scrollHeight - clientHeight - scrollTop > scrollThreshold);
  }, []);

  useEffect(() => {
    const viewportRef = scrollAreaViewport.current;
    if (viewportRef) {
      viewportRef.addEventListener('scroll', handleScroll);
      return () => viewportRef.removeEventListener('scroll', handleScroll);
    }
  }, [handleScroll]);

  useEffect(() => {
    // Automatically scroll to bottom on new messages or typing indicator changes
    scrollToBottom();
  }, [messages, isAiTyping, scrollToBottom]);

  // Toggle message expansion
  const toggleMessageExpansion = (id: string) => {
    setMessages(prev => 
      prev.map(message => 
        message.id === id 
          ? { ...message, isExpanded: !message.isExpanded } 
          : message
      )
    );
  };

  // Voice input handling
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Reset chunks
      audioChunksRef.current = [];
      
      // Create media recorder
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      
      // Start recording
      recorder.start();
      setIsRecording(true);
      
      // Handle data available event
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };
      
      // Handle recording stop
      recorder.onstop = () => {
        // Create audio blob
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        
        // Here you would send the audio to a speech-to-text service
        // For now, we'll simulate it with a timeout
        setIsListening(true);
        
        setTimeout(() => {
          // Simulating voice recognition result
          const fakePhrases = [
            "How to treat powdery mildew on tomatoes?",
            "What's the best fertilizer for corn crops?",
            "When should I plant winter wheat?",
            "How do I prevent apple scab?",
          ];
          const randomPhrase = fakePhrases[Math.floor(Math.random() * fakePhrases.length)];
          
          setInput(randomPhrase);
          setIsListening(false);
          
          // Close all tracks to properly release microphone
          stream.getTracks().forEach(track => track.stop());
        }, 1500);
      };
    } catch (err) {
      console.error("Error accessing microphone:", err);
      alert("Could not access microphone. Please check your browser permissions.");
    }
  };
  
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  // Clear conversation
  const clearConversation = () => {
    setMessages([
      {
        id: 'initial',
        text: "Welcome back! What farming challenge can I help with today?",
        sender: 'ai',
        timestamp: Date.now(),
        isExpanded: true,
      },
    ]);
    setChatHistory([]);
    setLastTopic(null);
    
    // Generate a new session ID when conversation is cleared
    const newSessionId = `session_${Math.random().toString(36).substring(2, 15)}`;
    setSessionId(newSessionId);
    if (typeof window !== 'undefined') {
      localStorage.setItem('farmwise_chat_session_id', newSessionId);
    }
  };

  // Export conversation
  const exportConversation = () => {
    const conversationText = messages
      .map(msg => `[${new Date(msg.timestamp).toLocaleString()}] ${msg.sender === 'ai' ? 'FarmWise AI' : 'You'}: ${msg.text}`)
      .join('\n\n');
    
    const blob = new Blob([conversationText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `farmwise-chat-${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(a);
    a.click();
    
    // Cleanup
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Send message to backend API
  const handleSend = async (textToSend?: string) => {
    const messageText = textToSend || input.trim();
    if (!messageText || isAiTyping) return;

    const newUserMessage: Message = {
      id: Math.random().toString(36).substring(7),
      text: messageText,
      sender: 'user',
      timestamp: Date.now(),
      isExpanded: true,
    };

    setMessages((prev) => [...prev, newUserMessage]);
    setInput('');
    setIsAiTyping(true);

    try {
      // Call the backend API
      const response = await fetch('/api/chat-treatment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          message: messageText,
          history: chatHistory,
          session_id: sessionId // Send session ID for conversation tracking
        })
      });

      if (!response.ok) {
        throw new Error('Failed to get response from AI advisor');
      }

      const data = await response.json();
      let aiResponseText = data.ai_response || "I'm sorry, I couldn't process that request.";
      const newHistory = data.history || [];
      
      // Transform the AI response to make it more conversational
      aiResponseText = transformAiResponse(aiResponseText);
      
      // Update session ID if the server returns a new one
      if (data.session_id) {
        setSessionId(data.session_id);
        if (typeof window !== 'undefined') {
          localStorage.setItem('farmwise_chat_session_id', data.session_id);
        }
      }

      // Update chat history for context
      setChatHistory(newHistory);

      // Try to extract the main topic from the response for better follow-up handling
      try {
        const topicMatch = aiResponseText.match(/(?:about|regarding|on|for)\s+([a-zA-Z\s]+(?:deficiency|disease|pest|weed|treatment|management))/i);
        if (topicMatch && topicMatch[1]) {
          setLastTopic(topicMatch[1].trim());
        }
      } catch (e) {
        console.log("Topic extraction error:", e);
      }

      const newAiMessage: Message = {
        id: Math.random().toString(36).substring(7),
        text: aiResponseText,
        sender: 'ai',
        timestamp: Date.now(),
        isExpanded: true,
      };
      
      setMessages((prev) => [...prev, newAiMessage]);
    } catch (error) {
      console.error('Error communicating with AI service:', error);
      
      const errorMessage: Message = {
        id: Math.random().toString(36).substring(7),
        text: "Oops! Looks like my connection to the farming database is acting up. Try again in a moment or refresh the page if it keeps happening!",
        sender: 'ai',
        timestamp: Date.now(),
        isExpanded: true,
      };
      
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsAiTyping(false);
    }
  };

  // Key press handler
  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  // Message component
  const MessageComponent = ({ message }: { message: Message }) => {
    const isAi = message.sender === 'ai';
    const textLength = message.text.length;
    const shouldCollapse = textLength > 300;
    const showExpansionControl = shouldCollapse && message.isExpanded !== undefined;
    
    return (
      <Box className={isAi ? classes.aiMessageContainer : classes.userMessageContainer}>
        <Group gap="sm" align="flex-start" className={isAi ? classes.aiMessageGroup : classes.userMessageGroup}>
          {isAi && (
            <Avatar radius="xl" color="violet" className={classes.messageAvatar}>
              <IconBrain size="1.2rem" />
            </Avatar>
          )}
          
          <Box className={classes.messageContentBox}>
            {/* Message header with timestamp and tools */}
            <Group justify="space-between" className={classes.messageHeader}>
              {isAi && <Text size="xs" fw={500} className={classes.senderName}>FarmWise AI</Text>}
              
              <Group gap="xs">
                {settings.showTimestamps && (
                  <Text size="xs" c="dimmed" className={classes.timestamp}>
                    {formatTimestamp(message.timestamp)}
                  </Text>
                )}
                
                <Menu shadow="md" width={200} position="bottom-end">
                  <Menu.Target>
                    <ActionIcon size="xs" variant="subtle" color="gray" className={classes.messageMenuButton}>
                      <IconDotsVertical size="0.8rem" />
                    </ActionIcon>
                  </Menu.Target>
                  
                  <Menu.Dropdown>
                    <CopyButton value={message.text} timeout={2000}>
                      {({ copied, copy }) => (
                        <Menu.Item 
                          leftSection={copied ? <IconCheck size={14} /> : <IconCopy size={14} />} 
                          onClick={copy}
                        >
                          {copied ? 'Copied!' : 'Copy text'}
                        </Menu.Item>
                      )}
                    </CopyButton>
                    
                    <Menu.Item 
                      leftSection={<IconShare size={14} />}
                      onClick={() => {
                        if (navigator.share) {
                          navigator.share({
                            title: 'FarmWise AI Chat',
                            text: message.text
                          }).catch(err => console.error('Error sharing:', err));
                        } else {
                          // Fallback copy to clipboard
                          navigator.clipboard.writeText(message.text);
                          alert('Copied to clipboard!');
                        }
                      }}
                    >
                      Share message
                    </Menu.Item>
                    
                    {message.sender === 'ai' && (
                      <Menu.Item 
                        leftSection={<IconRefresh size={14} />}
                        onClick={() => {
                          // Simulate regenerating a response
                          setIsAiTyping(true);
                          setTimeout(() => {
                            setIsAiTyping(false);
                            // Use the same message but add a note that it was regenerated
                            const regeneratedText = message.text + "\n\n[Note: This response was regenerated]";
                            setMessages(prev => 
                              prev.map(m => 
                                m.id === message.id ? { ...m, text: regeneratedText } : m
                              )
                            );
                          }, 2000);
                        }}
                      >
                        Regenerate response
                      </Menu.Item>
                    )}
                  </Menu.Dropdown>
                </Menu>
              </Group>
            </Group>
            
            {/* Message content with expansion control */}
            <Box>
              <Text 
                size="sm" 
                style={{ 
                  whiteSpace: 'pre-wrap',
                  maxHeight: showExpansionControl && !message.isExpanded ? rem(150) : undefined,
                  overflow: showExpansionControl && !message.isExpanded ? 'hidden' : undefined,
                }}
                className={classes.messageText}
                dangerouslySetInnerHTML={
                  message.text.includes('<') ? { __html: message.text } : undefined
                }
              >
                {message.text.includes('<') ? null : message.text}
              </Text>
              
              {showExpansionControl && (
                <UnstyledButton 
                  onClick={() => toggleMessageExpansion(message.id)}
                  className={classes.expansionButton}
                >
                  {message.isExpanded ? (
                    <Group gap="xs">
                      <Text size="xs">Show less</Text>
                      <IconChevronUp size="0.8rem" />
                    </Group>
                  ) : (
                    <Group gap="xs">
                      <Text size="xs">Show more</Text>
                      <IconChevronDown size="0.8rem" />
                    </Group>
                  )}
                </UnstyledButton>
              )}
            </Box>
          </Box>
          
          {message.sender === 'user' && (
            <Avatar radius="xl" color="blue" className={classes.messageAvatar}>
              <IconUser size="1.2rem" />
            </Avatar>
          )}
        </Group>
      </Box>
    );
  };

  return (
    <Paper 
      withBorder={false} 
      radius={isFullScreen ? 0 : "md"}
      className={`${classes.chatContainer} ${isFullScreen ? classes.fullScreen : ''}`}
    >
      {/* Chat header */}
      <Box className={classes.chatHeader}>
        <Group justify="space-between" wrap="nowrap">
          <Group gap="sm">
            <Avatar radius="xl" color="violet" size="md">
              <IconBrain size="1.2rem" />
            </Avatar>
            <Box>
              <Text fw={700} size="sm">FarmWise AI Advisor</Text>
              <Text size="xs" c="dimmed">Powered by Gemini 2.0 Flash</Text>
            </Box>
            {isAiTyping && (
              <Badge size="sm" variant="dot" color="green">Thinking...</Badge>
            )}
          </Group>
          
          <Group gap="xs">
            <Tooltip label="Settings">
              <ActionIcon 
                variant="subtle" 
                color="gray" 
                onClick={() => setIsDrawerOpen(true)}
                size="lg"
                radius="xl"
              >
                <IconSettings size="1.2rem" />
              </ActionIcon>
            </Tooltip>
            
            <Menu shadow="md" position="bottom-end">
              <Menu.Target>
                <ActionIcon variant="subtle" color="gray" size="lg" radius="xl">
                  <IconDotsVertical size="1.2rem" />
                </ActionIcon>
              </Menu.Target>
              
              <Menu.Dropdown>
                <Menu.Label>Conversation</Menu.Label>
                <Menu.Item 
                  leftSection={<IconDownload size={14} />}
                  onClick={exportConversation}
                >
                  Export chat
                </Menu.Item>
                <Menu.Item 
                  leftSection={<IconTrash size={14} />}
                  onClick={clearConversation}
                  color="red"
                >
                  Clear chat
                </Menu.Item>
                
                <Menu.Divider />
                
                <Menu.Label>Help</Menu.Label>
                <Menu.Item leftSection={<IconInfoCircle size={14} />}>
                  About FarmWise AI
                </Menu.Item>
                <Menu.Item leftSection={<IconVocabulary size={14} />}>
                  Usage tips
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          </Group>
        </Group>
      </Box>
      
      {/* Main chat content area */}
      <ScrollArea 
        className={classes.scrollArea} 
        viewportRef={scrollAreaViewport}
        onScrollPositionChange={handleScroll}
        scrollbarSize={8}
      >
        <Stack gap="md" p="md" className={classes.messagesContainer}>
          {messages.map((message) => (
            <MessageComponent key={message.id} message={message} />
          ))}
          
          {isAiTyping && (
            <Box className={classes.aiMessageContainer}>
              <Group gap="sm" align="flex-start" className={classes.aiMessageGroup}>
                <Avatar radius="xl" color="violet" className={classes.messageAvatar}>
                  <IconBrain size="1.2rem" />
                </Avatar>
                <Box className={classes.typingIndicatorBox}>
                  <Text size="xs" fw={500} className={classes.senderName}>FarmWise AI</Text>
                  <Loader color="violet" type="dots" size="sm" />
                </Box>
              </Group>
            </Box>
          )}
        </Stack>
      </ScrollArea>
      
      {/* Scroll to bottom button */}
      {scrollToBottomVisible && (
        <ActionIcon 
          className={classes.scrollToBottomButton}
          variant="filled"
          radius="xl"
          onClick={scrollToBottom}
          color="blue"
          size="md"
        >
          <IconArrowUp size="1rem" />
        </ActionIcon>
      )}

      {/* Input area */}
      <Box p="md" className={classes.inputArea}>
        {/* Suggested Prompts */} 
        {messages.length <= 2 && !isAiTyping && (
          <Group mb="md" gap="xs" className={classes.suggestedPromptsContainer}>
            <Text fw={500} size="xs" c="dimmed">Try asking about:</Text>
            <ScrollArea type="auto" w="100%" offsetScrollbars="x">
              <Group gap="xs" wrap="nowrap">
                {samplePrompts.map((prompt) => (
                  <Button 
                    key={prompt}
                    size="xs" 
                    variant="light"
                    color="gray"
                    onClick={() => handleSend(prompt)} 
                    leftSection={<IconSparkles size={12} />}
                    radius="xl"
                  >
                    {prompt}
                  </Button>
                ))}
              </Group>
            </ScrollArea>
          </Group>
        )}
        
        <Group wrap="nowrap" className={classes.inputGroup}>
          <TextInput
            className={classes.textInput}
            placeholder="Ask the AI Advisor anything..."
            value={input}
            onChange={(event) => setInput(event.currentTarget.value)}
            onKeyDown={handleKeyPress}
            disabled={isAiTyping}
            rightSectionWidth={isListening ? 120 : 80}
            radius="xl"
            size="md"
            rightSection={
              isListening ? (
                <Group wrap="nowrap" gap="xs">
                  <Loader size="xs" color="blue" />
                  <Text size="xs" fw={500}>Listening...</Text>
                </Group>
              ) : (
                <Group wrap="nowrap" gap="xs">
                  <Tooltip label={isRecording ? "Stop recording" : "Voice input"}>
                    <ActionIcon
                      variant={isRecording ? "filled" : "subtle"}
                      color={isRecording ? "red" : "gray"}
                      onClick={isRecording ? stopRecording : startRecording}
                      size="lg"
                      radius="xl"
                    >
                      <IconMicrophone size="1rem" />
                    </ActionIcon>
                  </Tooltip>
                  <ActionIcon 
                    size="lg"
                    variant="gradient"
                    gradient={{ from: 'blue', to: 'cyan' }}
                    onClick={() => handleSend()} 
                    disabled={!input.trim() || isAiTyping}
                    radius="xl"
                  >
                    <IconSend size="1rem" />
                  </ActionIcon>
                </Group>
              )
            }
          />
        </Group>
        
        <Group mt="xs" justify="center">
          <Text size="xs" c="dimmed">
            <Kbd>Enter</Kbd> to send • <Kbd>Shift</Kbd>+<Kbd>Enter</Kbd> for new line
          </Text>
        </Group>
      </Box>
      
      {/* Settings drawer */}
      <Drawer
        opened={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title="Chat Settings"
        position="right"
        padding="lg"
      >
        <Stack>
          <Accordion defaultValue="appearance">
            <Accordion.Item value="appearance">
              <Accordion.Control icon={<IconLayoutGrid size="1rem" />}>
                Appearance
              </Accordion.Control>
              <Accordion.Panel>
                <Stack gap="md">
                  <Switch 
                    label="Show message timestamps" 
                    checked={settings.showTimestamps}
                    onChange={(event) => 
                      setSettings(prev => ({ ...prev, showTimestamps: event.currentTarget.checked }))
                    }
                  />
                  <Switch 
                    label="Compact message view" 
                    checked={settings.compactMode}
                    onChange={(event) => 
                      setSettings(prev => ({ ...prev, compactMode: event.currentTarget.checked }))
                    }
                  />
                </Stack>
              </Accordion.Panel>
            </Accordion.Item>
            
            <Accordion.Item value="about">
              <Accordion.Control icon={<IconInfoCircle size="1rem" />}>
                About
              </Accordion.Control>
              <Accordion.Panel>
                <Stack>
                  <Text size="sm">
                    Your FarmWise AI Advisor is a friendly farming expert, powered by Google's Gemini.
                    It's specialized in providing treatment advice for crop diseases and weeds, drawing from our curated datasets.
                    It can also chat about a range of other agricultural topics in a helpful way!
                  </Text>
                  <Group>
                    <Badge color="blue">Version 2.2.0 (Enhanced)</Badge>
                    <Badge color="violet">Gemini Powered</Badge>
                  </Group>
                </Stack>
              </Accordion.Panel>
            </Accordion.Item>
          </Accordion>
          
          <Divider my="md" />
          
          <Button
            variant="outline"
            color="red"
            onClick={clearConversation}
            leftSection={<IconTrash size="1rem" />}
          >
            Clear Conversation
          </Button>
          
          <Button
            variant="outline"
            onClick={exportConversation}
            leftSection={<IconDownload size="1rem" />}
          >
            Export Conversation
          </Button>
        </Stack>
      </Drawer>
    </Paper>
  );
} 