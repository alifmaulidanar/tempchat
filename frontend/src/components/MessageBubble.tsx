/* eslint-disable @typescript-eslint/no-explicit-any */
const MessageBubble = ({ message, currentUser }: { message: any, currentUser: any }) => {
  const isSender = message.sender === currentUser;
  const messageTime = new Date(message.time);
  const formattedText = message.text.replaceAll('\n', '<br>');

  return (
    <div className={`flex ${isSender ? 'justify-end' : 'justify-start'} mb-2`}>
      <div
        className={`p-2 rounded-lg max-w-xs ${
          isSender ? 'bg-blue-500 text-white' : 'bg-gray-700 text-white'
        }`}
      >
        <div className="text-sm" dangerouslySetInnerHTML={{ __html: formattedText }}></div>
        <div className={`text-xs mt-1 ${isSender ? 'text-neutral-200' : 'text-gray-400'}`}>
          {messageTime.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })} - {isSender ? 'You' : message.sender}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
