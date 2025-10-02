// Plik: frontend/src/Navbar.js

import React from 'react';
import { NavLink } from 'react-router-dom';

// Dodajemy onLogout jako props
function Navbar({ onLogout }) {
  return (
    <nav className="navbar">
      <div className="navbar-brand">Menedżer Filamentów</div>
      <div className="navbar-links">
        <NavLink to="/warehouse">Magazyn</NavLink>
        <NavLink to="/clients">Klienci</NavLink>
        <NavLink to="/orders">Zamówienia</NavLink>
      </div>
      {/* Przenosimy przycisk tutaj! */}
      <button onClick={onLogout} className="logout-button">Wyloguj</button>
    </nav>
  );
}

export default Navbar;