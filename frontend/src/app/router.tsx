"use client"

import { useEffect } from "react"
import { BrowserRouter, Routes, Route } from "react-router-dom"

export function AppRouter() {
  useEffect(() => {
    console.log("Frontend is trying to connect...")
    fetch("http://localhost:5000")
      .then(res => res.json())
      .then(data => console.log("Backend says:", data))
      .catch(err => console.log("Error:", err))
  }, [])

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={
          <div style={{padding: "50px", textAlign: "center"}}>
            <h1>Landing Page Connected to Backend</h1>
            <p>Open F12 Console to see backend response</p>
          </div>
        } />
      </Routes>
    </BrowserRouter>
  )
}