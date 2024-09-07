/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button, Input, Card, Modal, message, notification } from 'antd';
import { CopyOutlined } from '@ant-design/icons';
import MessageBubble from './MessageBubble';

const ChatRoom = () => {
  const location = useLocation();
  const { id: code, username } = location.state || {};
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [, setWaitingForConfirmation] = useState(false);
  const [confirmationReceived, setConfirmationReceived] = useState(false);
  const [isSocketConnected, setIsSocketConnected] = useState(false);
  const [isEndChatModalVisible, setIsEndChatModalVisible] = useState(false);
  const socketRef = useRef<WebSocket | null>(null);
  const navigate = useNavigate();
  const messageSetRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    document.title = 'TempChat - Chat Room';
  }, []);

  useEffect(() => {
    if (!code || !username) {
      message.error('Invalid chat room.');
      navigate('/');
      return;
    }

    socketRef.current = new WebSocket(`ws://localhost:3000/chat?id=${code}&username=${username}`);

    socketRef.current.onopen = () => {
      setIsSocketConnected(true);
      if (socketRef.current?.readyState === WebSocket.OPEN) {
        console.log('WebSocket connected, sending join message');
        socketRef.current.send(JSON.stringify({ type: 'join', username }));
      }
    };

    socketRef.current.onmessage = (event) => {
      const message = JSON.parse(event.data);
      console.log('Received message:', message);

      // Unique message ID
      const messageId = `${message.type}-${message.text}-${message.time}`;

      // Duplication check
      if (
        message.type !== 'endChatDecline' &&
        message.type !== 'endChatRequest' &&
        messageSetRef.current.has(messageId)
      ) {
        console.log('Duplicate message detected, skipping...');
        return;
      }

      // Add message ID to the set to avoid duplication except for "join", "endChatRequest", and "endChatDecline"
      if (message.type !== 'endChatDecline' && message.type !== 'join' && message.type !== 'endChatRequest') {
        messageSetRef.current.add(messageId);
      }

      switch (message.type) {
        case 'disconnect':
          setMessages((prevMessages) => [
            ...prevMessages,
            { text: `${message.username} has left the chat.`, type: 'system', time: new Date().toISOString() },
          ]);
          break;
        case 'join':
          setMessages((prevMessages) => [
            ...prevMessages,
            { text: `${message.username} has joined the chat.`, type: 'system', time: new Date().toISOString() },
          ]);
          break;
        case 'endChatRequest':
          console.log('Received endChatRequest from:', message.username);
          if (message.username !== username) {
            setIsEndChatModalVisible(true);
          }
          break;
        case 'endChatConfirm':
          setConfirmationReceived(true);
          setWaitingForConfirmation(false);
          closeWebSocket();
          navigate('/');
          break;
        case 'endChatDecline':
          console.log('Received endChatDecline, resetting states');
          setWaitingForConfirmation(false);
          setIsEndChatModalVisible(false);
          notification.info({
            message: 'Chat End Request Declined',
            description: 'Chat end request was declined. Continue chatting.',
            placement: 'topRight',
          });
          break;
        default:
          setMessages((prevMessages) => [...prevMessages, message]);
          break;
      }
    };

    socketRef.current.onerror = (error) => {
      console.error('WebSocket error:', error);
      message.error('WebSocket connection failed.');
      setIsSocketConnected(false);
    };

    socketRef.current.onclose = () => {
      setMessages((prevMessages) => [
        ...prevMessages,
        { text: `${username} has left the chat.`, type: 'system', time: new Date().toISOString() },
      ]);
    };

    return () => closeWebSocket();
  }, [code, username]);

  const closeWebSocket = () => {
    if (socketRef.current && isSocketConnected) {
      socketRef.current.close();
      setIsSocketConnected(false);
    }
  };

  const sendMessage = () => {
    if (newMessage.trim() === '') return;
    const message = { type: 'message', sender: username, text: newMessage, time: new Date().toISOString() };
    const messageId = `${message.type}-${message.text}-${message.time}`;

    if (socketRef.current && isSocketConnected && !messageSetRef.current.has(messageId)) {
      socketRef.current.send(JSON.stringify(message));
      setMessages((prevMessages) => [...prevMessages, message]);
      messageSetRef.current.add(messageId);
    }
    setNewMessage('');
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const requestEndChat = () => {
    Modal.confirm({
      title: 'End Chat',
      content: 'Are you sure you want to end this chat? Both users must confirm to end the chat.',
      onOk: () => {
        if (socketRef.current && isSocketConnected) {
          socketRef.current.send(JSON.stringify({ type: 'endChatRequest', username }));
          setWaitingForConfirmation(true);
          setIsEndChatModalVisible(false);
        }
      },
    });
  };

  const confirmEndChat = () => {
    if (socketRef.current && isSocketConnected) {
      socketRef.current.send(JSON.stringify({ type: 'endChatConfirm', username }));
      setConfirmationReceived(true);
      setWaitingForConfirmation(false);
      closeWebSocket();
      navigate('/');
    }
  };

  const declineEndChat = () => {
    if (socketRef.current && isSocketConnected) {
      socketRef.current.send(JSON.stringify({ type: 'endChatDecline', username }));
    }
    setIsEndChatModalVisible(false);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(code || '').then(() => {
      message.success('Chat code copied to clipboard!');
    }).catch(() => {
      message.error('Failed to copy chat code.');
    });
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen w-screen bg-gray-100">
      <Card style={{ width: 600 }} className="shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-xl font-bold">Chat Room</h1>
          <div className="flex items-center">
            <span className="text-gray-600 mr-2">{code}</span>
            <Button icon={<CopyOutlined />} onClick={handleCopyCode} />
          </div>
          <Button danger onClick={requestEndChat}>
            End Chat
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto p-4" style={{ height: '400px' }}>
          {messages.map((message, index) => (
            message.type === 'system' ? (
              <div key={index} className="text-center text-gray-500 text-sm mb-2">
                {message.text}
              </div>
            ) : (
              <MessageBubble key={index} message={message} currentUser={username} />
            )
          ))}
        </div>
        {isEndChatModalVisible && !confirmationReceived && (
          <Modal
            title="End Chat Confirmation"
            open={isEndChatModalVisible}
            onOk={confirmEndChat}
            onCancel={declineEndChat}
          >
            <p>User requested to end the chat. Do you agree?</p>
          </Modal>
        )}
        <div className="flex p-4">
          <Input.TextArea
            rows={2}
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-1 mr-2"
          />
          <Button type="primary" onClick={sendMessage}>
            Send
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default ChatRoom;
