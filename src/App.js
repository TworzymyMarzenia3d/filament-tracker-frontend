// Plik: frontend/src/App.js

import React, { useState } from 'react';
import './App.css';
import Login from './Login'; // Importujemy nasz nowy komponent logowania

// Pobieramy adres API ze zmiennych środowiskowych
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

// =======================================================
// Komponent głównej aplikacji (to, co widzi zalogowany użytkownik)
// =======================================================
function MainApp({ token, onLogout }) {
  const [filamentTypes, setFilamentTypes] = useState([]);
  const [manufacturer, setManufacturer] = useState('');
  const [material, setMaterial] = useState('');
  const [color, setColor] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Funkcja do pobierania danych (teraz wysyła token)
  const fetchFilamentTypes = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_URL}/api/filament-types`, {
        headers: { 'Authorization': `Bearer ${token}` } // KLUCZOWA ZMIANA!
      });
      if (response.status === 401 || response.status === 403) {
        // Jeśli token jest nieważny, wylogowujemy
        onLogout();
        return;
      }
      if (!response.ok) throw new Error('Coś poszło nie tak z siecią!');
      const data = await response.json();
      setFilamentTypes(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    fetchFilamentTypes();
  }, [token]); // Uruchom ponownie, jeśli zmieni się token

  // Funkcja do wysyłania formularza (teraz wysyła token)
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_URL}/api/filament-types`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` // KLUCZOWA ZMIANA!
        },
        body: JSON.stringify({ manufacturer, material, color }),
      });
      if (!response.ok) throw new Error('Nie udało się dodać filamentu!');
      fetchFilamentTypes();
      setManufacturer('');
      setMaterial('');
      setColor('');
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Menedżer Filamentów</h1>
        <button onClick={onLogout} className="logout-button">Wyloguj</button>
      </header>
      <main className="container">
        <section className="form-section">
          <h2>Dodaj nowy typ filamentu</h2>
          <form onSubmit={handleSubmit}>
            <input type="text" placeholder="Producent" value={manufacturer} onChange={(e) => setManufacturer(e.target.value)} required />
            <input type="text" placeholder="Materiał (np. PLA, PETG)" value={material} onChange={(e) => setMaterial(e.target.value)} required />
            <input type="text" placeholder="Kolor" value={color} onChange={(e) => setColor(e.target.value)} required />
            <button type="submit">Dodaj</button>
          </form>
        </section>
        <section className="list-section">
          <h2>Lista zdefiniowanych filamentów</h2>
          {isLoading && <p>Ładowanie danych...</p>}
          {error && <p className="error-message">Błąd: {error}</p>}
          {!isLoading && !error && (
            <ul>
              {filamentTypes.length === 0 ? <p>Brak filamentów w bazie. Dodaj pierwszy!</p> :
                filamentTypes.map((filament) => (
                  <li key={filament.id}><strong>{filament.manufacturer}</strong> {filament.material} - {filament.color}</li>
                ))}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
}

// =======================================================
// Główny komponent, który zarządza stanem logowania
// =======================================================
function App() {
  // Próbujemy odczytać token z pamięci przeglądarki
  const [token, setToken] = useState(localStorage.getItem('authToken'));

  const handleLoginSuccess = (newToken) => {
    // Zapisujemy token w pamięci przeglądarki, aby nie trzeba było się logować po odświeżeniu
    localStorage.setItem('authToken', newToken);
    setToken(newToken);
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    setToken(null);
  };

  // Jeśli nie ma tokenu (nie jesteśmy zalogowani), pokazujemy ekran logowania
  if (!token) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  // Jeśli jesteśmy zalogowani, pokazujemy główną aplikację
  return <MainApp token={token} onLogout={handleLogout} />;
}

export default App;