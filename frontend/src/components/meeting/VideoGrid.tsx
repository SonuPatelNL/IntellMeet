import { useEffect, useRef, useImperativeHandle, forwardRef } from 'react'

const VideoGrid = forwardRef((props, ref) => {
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
     .then(stream => {
        streamRef.current = stream
        if(videoRef.current) videoRef.current.srcObject = stream
      })
     .catch(err => console.error(err))
  }, [])

  useImperativeHandle(ref, () => ({
    toggleMic: () => {
      const audioTrack = streamRef.current?.getAudioTracks()[0]
      if(audioTrack) audioTrack.enabled =!audioTrack.enabled
    },
    toggleCamera: () => {
      const videoTrack = streamRef.current?.getVideoTracks()[0]
      if(videoTrack) videoTrack.enabled =!videoTrack.enabled
    }
  }))

  return (
    <div className="flex-1 bg-black flex items-center justify-center">
      <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
    </div>
  )
})

export default VideoGrid