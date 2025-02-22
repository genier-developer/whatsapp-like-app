import { FC, useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import s from "./chat.module.scss";

type Message = {
  text: string;
  fromUser: boolean;
};

export const Chat: FC = () => {
  const { register, reset, handleSubmit } = useForm<{ text: string }>();
  const [messages, setMessages] = useState<Message[]>([]);
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const [error, setError] = useState<string>("");
  const navigate = useNavigate();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isPollingActive, setIsPollingActive] = useState<boolean>(true);
  const isMounted = useRef(true);

  const idInstance = import.meta.env.VITE_ID_INSTANCE;
  const apiTokenInstance = import.meta.env.VITE_API_TOKEN_INSTANCE;

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;

    const fetchMessages = async () => {
      if (!idInstance || !apiTokenInstance) {
        console.error("API keys missing");
        navigate("/login");
        return;
      }

      const url = `https://1103.api.green-api.com/waInstance${idInstance}/receiveNotification/${apiTokenInstance}`;
      
      try {
        const { data } = await axios.get(url);
        
        if (data && data.receiptId) {
          if (
            data.body.typeWebhook === 'incomingMessageReceived' && 
            data.body.messageData?.textMessageData?.textMessage
          ) {
            setMessages((prev) => [
              ...prev,
              { text: data.body.messageData.textMessageData.textMessage, fromUser: false },
            ]);
          }
          
          await axios.delete(
            `https://1103.api.green-api.com/waInstance${idInstance}/deleteNotification/${apiTokenInstance}/${data.receiptId}`
          );
        }
      } catch (error) {
        console.error("Error of receiving messages:", error);
        if (axios.isAxiosError(error)) {
          console.error("API Error details:", error.response?.data);
        }
        setIsPollingActive(false);
        return;
      }

      if (isMounted.current && isPollingActive) {
        timeoutId = setTimeout(fetchMessages, 5000);
      }
    };

    if (isPollingActive) {
      fetchMessages();
    }

    return () => {
      isMounted.current = false;
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [idInstance, apiTokenInstance, isPollingActive, navigate]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const validatePhoneNumber = (number: string): boolean => {
    const cleanNumber = number.replace(/\D/g, '');
    return /^\d{10,15}$/.test(cleanNumber);
  };

  const formatPhoneNumber = (number: string): string => {
    return number.replace(/\D/g, '');
  };

  const onSubmit = async ({ text }: { text: string }) => {
    setError("");
    
    if (!phoneNumber.trim()) {
      setError("Please, enter the phone number");
      return;
    }

    const formattedNumber = formatPhoneNumber(phoneNumber);
    if (!validatePhoneNumber(formattedNumber)) {
      setError("Please, enter the correct phone number (10-15 digits)");
      return;
    }

    if (!idInstance || !apiTokenInstance) {
      setError("Auth error. Please, log in again");
      return;
    }

    const chatId = `${formattedNumber}@c.us`;
    const url = `https://1103.api.green-api.com/waInstance${idInstance}/sendMessage/${apiTokenInstance}`;

    try {
      const response = await axios.post(url, { 
        chatId, 
        message: text,
        quotedMessageId: null
      });
      
      if (response.data && response.data.idMessage) {
        setMessages((prev) => [...prev, { text, fromUser: true }]);
        reset();
      } else {
        setError("Error of sending message. Please, try again");
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error("Error sending message:", error.response?.data || error.message);
      } else {
        console.error("Unexpected error:", error);
      }
      setError("Error of sending message. Please, try again");
    }
  };

  const handleLogout = () => {
    navigate("/");
  };

  const togglePolling = () => {
    setIsPollingActive(prev => !prev);
  };

  return (
    <div className={s.chat}>
      <header className={s.header}>
        <h1>WhatsApp Chat</h1>
        <>
          <button 
            className={s.button} 
            onClick={togglePolling}
            style={{ marginRight: '10px' }}
          >
            {isPollingActive ? 'Stop updating' : 'Resume updating'}
          </button>
          <button className={s.button} onClick={handleLogout}>Exit</button>
        </>
      </header>

      <input
        className={s.input}
        value={phoneNumber}
        onChange={(e) => {
          const value = e.target.value;
          setError("");
          if (/^[+\d\s-]*$/.test(value)) {
            setPhoneNumber(value);
          }
        }}
        placeholder="Enter the phone number (for example: +79123456789)"
      />

      {error && <div className={s.error}>{error}</div>}

      <div className={s.messages}>
        {messages.map((msg, index) => (
          <div key={index} className={msg.fromUser ? s.sent : s.received}>
            {msg.text}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form className={s.form} onSubmit={handleSubmit(onSubmit)}>
        <input className={s.input} {...register("text")} placeholder="Type a message..." />
        <button className={s.button} type="submit">Send</button>
      </form>
    </div>
  );
};
