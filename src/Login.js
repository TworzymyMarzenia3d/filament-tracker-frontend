// Plik: frontend/src/Login.js

import React, { useState } from 'react';

// Pobieramy adres API ze zmiennych środowiskowych
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

function Login({ onLoginSuccess }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      if (response.ok) {
        const { token } = await response.json();
        // Jeśli logowanie się powiedzie, przekazujemy token "do góry" do App.js
        onLoginSuccess(token);
      } else {
        setError('Nieprawidłowe hasło!');
      }
    } catch (err) {
      setError('Błąd połączenia z serwerem.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <form onSubmit={handleSubmit} className="login-form">
        <h1>Menedżer Filamentów</h1>
        <h2>Logowanie</h2>
        <input
          type="password"
          placeholder="Hasło"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={isLoading}
        />
        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Logowanie...' : 'Zaloguj'}
        </button>
        {error && <p className="error-message">{error}</p>}
      </form>
    </div>
  );
}

export default Login;