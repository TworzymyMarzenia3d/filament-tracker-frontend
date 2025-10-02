import React, { useState, useEffect } from 'react';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

function Warehouse({ token }) {
  const [filamentTypes, setFilamentTypes] = useState([]);
  const [manufacturer, setManufacturer] = useState('');
  const [material, setMaterial] = useState('');
  const [color, setColor] = useState('');
  const [purchases, setPurchases] = useState([]);
  const [selectedFilamentId, setSelectedFilamentId] = useState('');
  const [purchasePrice, setPurchasePrice] = useState('');
  const [purchaseWeight, setPurchaseWeight] = useState('');
  const [purchaseCurrency, setPurchaseCurrency] = useState('PLN');
  const [exchangeRate, setExchangeRate] = useState('1');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const headers = { 'Authorization': `Bearer ${token}` };
      const typesResponse = await fetch(`${API_URL}/api/filament-types`, { headers });
      if (!typesResponse.ok) throw new Error('Błąd pobierania typów filamentów');
      const typesData = await typesResponse.json();
      setFilamentTypes(typesData);
      if (typesData.length > 0 && !selectedFilamentId) {
        setSelectedFilamentId(typesData[0].id);
      }
      const purchasesResponse = await fetch(`${API_URL}/api/purchases`, { headers });
      if (!purchasesResponse.ok) throw new Error('Błąd pobierania zakupów');
      const purchasesData = await purchasesResponse.json();
      setPurchases(purchasesData);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [token]);

  const handleAddType = async (e) => {
    e.preventDefault();
    try {
        await fetch(`${API_URL}/api/filament-types`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ manufacturer, material, color }),
        });
        fetchData();
        setManufacturer(''); setMaterial(''); setColor('');
    } catch (err) { alert(err.message); }
  };

  const handleAddPurchase = async (e) => {
    e.preventDefault();
    if (!selectedFilamentId) return alert("Proszę wybrać typ filamentu.");
    try {
        await fetch(`${API_URL}/api/purchases`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({
                filamentTypeId: selectedFilamentId,
                price: purchasePrice,
                initialWeight: purchaseWeight,
                currency: purchaseCurrency,
                exchangeRate: exchangeRate,
            }),
        });
        fetchData();
        setPurchasePrice(''); setPurchaseWeight(''); setPurchaseCurrency('PLN'); setExchangeRate('1');
    } catch (err) { alert(err.message); }
  };

  return (
    <>
      <div className="management-panel">
          <section className="form-section">
              <h2>Dodaj nowy typ</h2>
              <form onSubmit={handleAddType}>
                  <input type="text" placeholder="Producent" value={manufacturer} onChange={(e) => setManufacturer(e.target.value)} required />
                  <input type="text" placeholder="Materiał" value={material} onChange={(e) => setMaterial(e.target.value)} required />
                  <input type="text" placeholder="Kolor" value={color} onChange={(e) => setColor(e.target.value)} required />
                  <button type="submit">Dodaj typ</button>
              </form>
          </section>
          <section className="form-section">
              <h2>Dodaj nowy zakup</h2>
              <form onSubmit={handleAddPurchase}>
                  <select value={selectedFilamentId} onChange={(e) => setSelectedFilamentId(e.target.value)} required>
                      <option value="" disabled>-- Wybierz typ --</option>
                      {filamentTypes.map(ft => <option key={ft.id} value={ft.id}>{ft.manufacturer} {ft.material} {ft.color}</option>)}
                  </select>
                  <input type="number" placeholder="Cena" value={purchasePrice} onChange={(e) => setPurchasePrice(e.target.value)} required step="0.01" />
                  <input type="number" placeholder="Waga (g)" value={purchaseWeight} onChange={(e) => setPurchaseWeight(e.target.value)} required />
                  <select value={purchaseCurrency} onChange={(e) => { const nc = e.target.value; setPurchaseCurrency(nc); if (nc === 'PLN') setExchangeRate('1'); }}>
                      <option value="PLN">PLN</option><option value="EUR">EUR</option><option value="USD">USD</option><option value="CZK">CZK</option>
                  </select>
                  {purchaseCurrency !== 'PLN' && <input type="number" placeholder={`Kurs ${purchaseCurrency}/PLN`} value={exchangeRate} onChange={(e) => setExchangeRate(e.target.value)} required step="0.0001" />}
                  <button type="submit">Dodaj zakup</button>
              </form>
          </section>
      </div>

      <section className="list-section full-width">
        <h2>Stan magazynowy (zakupione szpule)</h2>
        {isLoading ? <p>Ładowanie...</p> : error ? <p className="error-message">{error}</p> : (
          <table>
            <thead><tr><th>Filament</th><th>Data zakupu</th><th>Waga (zostało / całość)</th><th>Cena zakupu (oryg.)</th><th>Koszt / gram (PLN)</th></tr></thead>
            <tbody>
              {purchases.length === 0 ? (<tr><td colSpan="5">Brak zakupów w bazie.</td></tr>) : (
                purchases.map((p) => (
                  <tr key={p.id}>
                    <td>{p.filamentType ? `${p.filamentType.manufacturer} ${p.filamentType.material} ${p.filamentType.color}` : 'Błąd danych'}</td>
                    <td>{new Date(p.purchaseDate).toLocaleDateString()}</td>
                    <td>{p.currentWeight}g / {p.initialWeight}g</td>
                    <td>{p.price.toFixed(2)} {p.currency}</td>
                    <td>{p.costPerGramInPLN.toFixed(4)} PLN</td>
                  </tr>
                )))}
            </tbody>
          </table>
        )}
      </section>
    </>
  );
}

export default Warehouse;