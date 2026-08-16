const API_URL = 'http://localhost:5176'; 
export const api = { 
  async health() { 
    const res = await fetch(`${API_URL}/health`); 
    return res.json(); 
  } 
} 
