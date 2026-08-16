import { useState } from 'react'

export default function ChatBox() {
  const [messages, setMessages] = useState<string[]>([])
  const [input, setInput] = useState('')

  const sendMessage = () => {
    if(input.trim() === '') return
    setMessages([...messages, input])
    setInput('')
  }

  return (
    <div className="w-80 bg-gray-100 border-l flex-col">
      <h3 className="font-bold p-4 border-b">Chat</h3>
      <div className="flex-1 p-4 overflow-y-auto">
        {messages.map((msg, i) => (
          <div key={i} className="bg-white rounded p-2 mb-2 text-sm">{msg}</div>
        ))}
      </div>
      <div className="p-2 border-t flex gap-2">
        <input 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          className="flex-1 border rounded px-2 py-1 text-sm"
          placeholder="Type a message..."
        />
        <button onClick={sendMessage} className="bg-blue-500 text-white px-3 py-1 rounded text-sm">
          Send
        </button>
      </div>
    </div>
  )
}