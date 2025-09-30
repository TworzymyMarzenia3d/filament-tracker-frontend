import React, { useState, useEffect } from 'react';
import './App.css';

// Adres naszego backendu. Na razie jest to adres lokalny.
// Po wdrożeniu na Render, ten adres zostanie automatycznie podmieniony.
// Adres naszego backendu
const API_URL = process.env.NODE_ENV === 'production'
  ? process.env.REACT_APP_API_URL
  : 'http://localhost:3001';

if (process.env.NODE_ENV === 'production' && !API_URL) {
  console.error("FATAL ERROR: REACT_APP_API_URL is not set in production environment!");
}

function App() {
  // Stany komponentu: przechowują dane, z którymi pracujemy
  const [filamentTypes, setFilamentTypes] = useState([]); // Lista filamentów z backendu
  const [manufacturer, setManufacturer] = useState(''); // Wartość pola "Producent"
  const [material, setMaterial] = useState('');       // Wartość pola "Materiał"
  const [color, setColor] = useState('');             // Wartość pola "Kolor"
  const [isLoading, setIsLoading] = useState(true);     // Czy dane się ładują?
  const [error, setError] = useState(null);           // Przechowuje ewentualne błędy

  // Funkcja do pobierania danych z backendu
  const fetchFilamentTypes = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_URL}/api/filament-types`);
      if (!response.ok) {
        throw new Error('Coś poszło nie tak z siecią!');
      }
      const data = await response.json();
      setFilamentTypes(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // useEffect to "hak", który uruchamia funkcję po pierwszym załadowaniu komponentu.
  // Pusta tablica [] na końcu oznacza "uruchom tylko raz".
  useEffect(() => {
    fetchFilamentTypes();
  }, []);

  // Funkcja do obsługi wysłania formularza
  const handleSubmit = async (e) => {
    e.preventDefault(); // Zapobiega przeładowaniu strony
    try {
      const response = await fetch(`${API_URL}/api/filament-types`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ manufacturer, material, color }),
      });
       if (!response.ok) {
        throw new Error('Nie udało się dodać filamentu!');
      }
      // Po dodaniu, odświeżamy listę i czyścimy pola formularza
      fetchFilamentTypes();
      setManufacturer('');
      setMaterial('');
      setColor('');
    } catch (err) {
       alert(err.message); // Prosty sposób na pokazanie błędu
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Menedżer Filamentów</h1>
      </header>
      <main className="container">
        <section className="form-section">
          <h2>Dodaj nowy typ filamentu</h2>
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder="Producent"
              value={manufacturer}
              onChange={(e) => setManufacturer(e.target.value)}
              required
            />
            <input
              type="text"
              placeholder="Materiał (np. PLA, PETG)"
              value={material}
              onChange={(e) => setMaterial(e.target.value)}
              required
            />
            <input
              type="text"
              placeholder="Kolor"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              required
            />
            <button type="submit">Dodaj</button>
          </form>
        </section>

        <section className="list-section">
          <h2>Lista zdefiniowanych filamentów</h2>
          {isLoading && <p>Ładowanie danych...</p>}
          {error && <p className="error-message">Błąd: {error}</p>}
          {!isLoading && !error && (
            <ul>
              {filamentTypes.length === 0 ? (
                <p>Brak filamentów w bazie. Dodaj pierwszy!</p>
              ) : (
                filamentTypes.map((filament) => (
                  <li key={filament.id}>
                    <strong>{filament.manufacturer}</strong> {filament.material} - {filament.color}
                  </li>
                ))
              )}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
}

export default App;