import React from 'react';
import { Card } from 'antd';

const UnderConstruction: React.FC = () => {
  return (
    <div className="fixed top-0 left-0 w-full h-full flex justify-center items-center bg-[#0B2447] bg-opacity-60 backdrop-blur-md z-50">
      <Card
        className="bg-white bg-opacity-10 backdrop-blur-lg border border-white border-opacity-20 rounded-2xl shadow-xl p-6 text-center"
        style={{ maxWidth: 500 }}
      >
        <h1 className="text-3xl md:text-4xl font-bold mb-4 text-white">
          We're Coming Soon!
        </h1>
        <p className="text-base md:text-lg mb-6 text-gray-200">
          Our website is under construction. Stay tuned for something amazing!
        </p>
        <img
          src="https://images.pexels.com/photos/211122/pexels-photo-211122.jpeg"
          alt="Under Construction Illustration"
          className="w-full max-w-xs md:max-w-md lg:max-w-lg mx-auto rounded-lg"
        />
      </Card>
    </div>
  );
};

export default UnderConstruction;
