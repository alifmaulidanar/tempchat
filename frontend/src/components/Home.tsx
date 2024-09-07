import { useState, useEffect } from 'react';
import axios from 'axios';
import { Button, Input, message, Card } from 'antd';
import { useNavigate } from 'react-router-dom';
import { uniqueNamesGenerator, adjectives, colors, animals } from 'unique-names-generator';

const Home = () => {
  const [code, setCode] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'TempChat';
  }, []);

  const generateRandomUsername = () => {
    return uniqueNamesGenerator({
      dictionaries: [adjectives, colors, animals],
      separator: '-',
      length: 3,
    });
  };

  const startChat = async () => {
    const username = generateRandomUsername();
    try {
      const response = await axios.get('http://localhost:3000/api/generate-code');
      const generatedCode = response.data.code;
      navigate(`/chat`, { state: { id: generatedCode, username } });
    } catch (error) {
      console.error(error);
      message.error('Gagal memulai chat.');
    }
  };

  const joinChat = () => {
    const username = generateRandomUsername();
    if (!code.trim()) {
      message.error('Kode unik harus diisi.');
      return;
    }
    navigate(`/chat`, { state: { id: code, username } });
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100 w-screen">
      <Card style={{ width: 400 }} className="shadow-lg">
        <h1 className="text-3xl font-bold mb-6 text-center">TempChat</h1>
        <Button type="primary" onClick={startChat} className="mb-4" block>
          Start Chat
        </Button>
        <Input
          placeholder="Have a unique code? Enter here"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="mb-4"
        />
        <Button type="primary" onClick={joinChat} block>
          Join Chat
        </Button>
      </Card>
    </div>
  );
};

export default Home;
