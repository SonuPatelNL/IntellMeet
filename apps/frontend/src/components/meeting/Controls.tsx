import { useState } from 'react'

export default function Controls({ onToggleMic, onToggleCamera }: any) {
  const [micOn, setMicOn] = useState(true)
  const [camOn, setCamOn] = useState(true)

  return (
    <div className="h-16 bg-gray-900 flex items-center justify-center gap-4">
      <button 
        onClick={() => {onToggleMic(); setMicOn(!micOn)}}
        className={`${micOn? 'bg-red-500' : 'bg-gray-500'} text-white px-4 py-2 rounded-full`}
      >
        {micOn? 'Mic On' : 'Mic Off'}
      </button>
      <button 
        onClick={() => {onToggleCamera(); setCamOn(!camOn)}}
        className={`${camOn? 'bg-red-500' : 'bg-gray-500'} text-white px-4 py-2 rounded-full`}
      >
        {camOn? 'Camera On' : 'Camera Off'}
      </button>
      <button className="bg-red-600 text-white px-6 py-2 rounded-full">Leave</button>
    </div>
  )
}