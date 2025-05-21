import { useEffect, useRef, useState } from "react";

import styles from "../styles/VideoPlayer.module.css";

// Example chat messages for demonstration
const EXAMPLE_MESSAGES = [
  "Great stream!",
  "Hello from Paris!",
  "Love your content!",
  "Nice moves!",
  "First time here, this is awesome!",
  "How long have you been streaming?",
  "This is amazing!",
  "Keep it up!",
  "Followed!",
  "You're so talented!",
  "Greetings from Germany!",
  "This made my day!",
  "Can't stop watching!",
];

interface ChatProps {
  onClose: () => void;
}

interface ChatMessage {
  text: string;
  isUser: boolean;
  position: number;
  id: number;
  exiting?: boolean;
}

export const Chat: React.FC<ChatProps> = ({ onClose }) => {
  const chatIntervalRef = useRef<NodeJS.Timeout>(null);
  const chatExitTimeoutRef = useRef<NodeJS.Timeout>(null);
  const chatInputRef = useRef<HTMLInputElement>(null);
  
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);

  const [chatInput, setChatInput] = useState("");
  const [sendCount, setSendCount] = useState(0);

  // Focus the chat input when the component mounts
  useEffect(() => {
    if (chatInputRef.current) {
      // Short delay to ensure the input is rendered
      setTimeout(() => {
        chatInputRef.current?.focus();
      }, 100);
    }

    // Start displaying messages
    startChatMessages();

    // Clean up on unmount
    return () => {
      stopChatMessages();
      if (chatExitTimeoutRef.current) {
        clearTimeout(chatExitTimeoutRef.current);
      }
    };
  }, []);

  // Function to get a random message from the example list
  const getRandomMessage = () => {
    return EXAMPLE_MESSAGES[
      Math.floor(Math.random() * EXAMPLE_MESSAGES.length)
    ];
  };

  // Start displaying chat messages
  const startChatMessages = () => {
    // Clear any existing messages and intervals
    setChatMessages([]);
    if (chatIntervalRef.current) {
      clearInterval(chatIntervalRef.current);
    }

    // Add first message immediately
    addChatMessage();

    // Wait for the first message to get to the top position
    // before setting up the regular interval
    setTimeout(() => {
      // Add a new message every 2 seconds
      chatIntervalRef.current = setInterval(() => {
        addChatMessage();
      }, 2000);
    }, 1000); // Wait for the first message to reach the top
  };

  // Stop chat message interval
  const stopChatMessages = () => {
    if (chatIntervalRef.current) {
      clearInterval(chatIntervalRef.current);
      chatIntervalRef.current = null;
    }
  };

  // Handle chat input change
  const handleChatInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setChatInput(e.target.value);
  };

  // Handle sending a chat message
  const handleSendMessage = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!chatInput.trim()) return; // Don't send empty messages

    // Increment the send counter
    setSendCount((prev) => prev + 1);

    // Add the user's message to chat
    addUserMessage(chatInput.trim());

    // Clear the input
    setChatInput("");

    // Focus the input field again
    if (chatInputRef.current) {
      chatInputRef.current.focus();
    }
  };

  // Add a user message to the chat
  const addUserMessage = (text: string) => {
    const userMessage = {
      text,
      isUser: true,
      position: 0,
      id: Date.now() + Math.random(),
    };

    setChatMessages((prevMessages) => {
      let newMessages = [...prevMessages];

      // If we already have 6 messages, handle normally
      if (newMessages.length >= 6) {
        // Normal handling for when queue is full
        const exitingMessage = {
          ...newMessages[5],
          exiting: true,
          id: Date.now() + Math.random(),
        };

        newMessages.splice(5, 1, exitingMessage);

        if (chatExitTimeoutRef.current) {
          clearTimeout(chatExitTimeoutRef.current);
        }

        chatExitTimeoutRef.current = setTimeout(() => {
          setChatMessages((messages) =>
            messages.filter((msg) => msg.id !== exitingMessage.id)
          );
        }, 2500);

        newMessages = [userMessage, ...newMessages.slice(0, 5)];
      }
      // If there are no messages, create backfill and animate to position 5
      else if (newMessages.length === 0) {
        // Backfill the queue with placeholder messages that start at position 5
        const backfill = [];

        // Add the user message at position 5 (top)
        userMessage.position = 5;
        backfill.push(userMessage);

        // Now animate this message to position 5 directly
        return backfill;
      }
      // If there are some messages but not a full queue
      else {
        // Add the new message
        newMessages = [userMessage, ...newMessages];
      }

      // Update positions for all messages
      newMessages = newMessages.map((msg, index) => ({
        ...msg,
        position: index,
      }));

      return newMessages;
    });
  };

  // Add a new automated chat message and handle position changes
  const addChatMessage = () => {
    const newMessage = getRandomMessage();

    setChatMessages((prevMessages) => {
      let newMessages = [...prevMessages];

      // If we already have 6 messages, handle normally
      if (newMessages.length >= 6) {
        // Normal handling for when queue is full
        const exitingMessage = {
          ...newMessages[5],
          exiting: true,
          id: Date.now() + Math.random(),
        };

        newMessages.splice(5, 1, exitingMessage);

        if (chatExitTimeoutRef.current) {
          clearTimeout(chatExitTimeoutRef.current);
        }

        chatExitTimeoutRef.current = setTimeout(() => {
          setChatMessages((messages) =>
            messages.filter((msg) => msg.id !== exitingMessage.id)
          );
        }, 2500);

        newMessages = [
          {
            text: newMessage,
            isUser: false,
            position: 0,
            id: Date.now() + Math.random(),
          },
          ...newMessages.slice(0, 5),
        ];
      }
      // If there are no messages, create backfill and animate to position 5
      else if (newMessages.length === 0) {
        // Backfill the queue with placeholder messages that start at position 5
        const backfill = [];

        // Add the automated message at position 5 (top)
        backfill.push({
          text: newMessage,
          isUser: false,
          position: 5,
          id: Date.now() + Math.random(),
        });

        // Now animate this message to position 5 directly
        return backfill;
      }
      // If there are some messages but not a full queue
      else {
        // Add the new message
        newMessages = [
          {
            text: newMessage,
            isUser: false,
            position: 0,
            id: Date.now() + Math.random(),
          },
          ...newMessages,
        ];
      }

      // Update positions for all messages
      newMessages = newMessages.map((msg, index) => ({
        ...msg,
        position: index,
      }));

      return newMessages;
    });
  };

  return (
    <div className={styles.chatOverlay} onClick={onClose}>
      <div
        className={styles.chatMessagesContainer}
        onClick={(e) => e.stopPropagation()}
      >
        {chatMessages.map((message) => (
          <div
            key={message.id}
            className={`${styles.chatMessage} ${styles[`position${message.position}`]} ${message.exiting ? styles.exit : ""} ${message.isUser ? styles.userMessage : ""}`}
          >
            {message.text}
          </div>
        ))}
      </div>

      <form
        className={styles.chatInputArea}
        onSubmit={handleSendMessage}
        onClick={(e) => e.stopPropagation()}
      >
        <input
          type="text"
          className={styles.chatInput}
          placeholder="Type a message..."
          value={chatInput}
          onChange={handleChatInputChange}
          ref={chatInputRef}
        />
        <button type="submit" className={styles.sendButton}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
          </svg>
          {sendCount > 0 && (
            <span className={styles.sendCounter}>+{sendCount}</span>
          )}
        </button>
      </form>
    </div>
  );
};
