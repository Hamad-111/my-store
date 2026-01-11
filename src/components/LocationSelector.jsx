import React, { useEffect, useState } from 'react';
import { Search } from 'lucide-react'; // REAL SEARCH ICON
import './LocationSelector.css';

export default function LocationSelector({ onClose, onSelect }) {
  const [cities, setCities] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Fetch Pakistan cities using API
  useEffect(() => {
    async function fetchCities() {
      try {
        const res = await fetch(
          'https://countriesnow.space/api/v0.1/countries'
        );

        if (!res.ok) throw new Error('API Failed');

        const data = await res.json();

        const pakistan = data.data.find(
          (c) => c.country.toLowerCase() === 'pakistan'
        );

        if (!pakistan) throw new Error('Pakistan Not Found');

        setCities(pakistan.cities || []);
      } catch (err) {
        console.error('API Error:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    }

    fetchCities();
  }, []);

  const filteredCities = cities.filter((city) =>
    city.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="location-overlay" onClick={onClose}>
      <div className="location-box" onClick={(e) => e.stopPropagation()}>
        {/* Close Icon */}
        <span className="close-icon" onClick={onClose}>
          ×
        </span>

        <div className="location-header">
          <h2>Select Location</h2>
          <p>Search and choose your delivery city.</p>
        </div>

        {/* Search Bar */}
        <div className="search-area">
          <Search className="search-locationicon" size={18} />
          <input
            type="text"
            placeholder="Search your city..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Loading Spinner */}
        {loading && <div className="loader"></div>}

        {/* Error Message */}
        {error && (
          <p className="error-msg">Failed to load cities. Please try again.</p>
        )}

        {/* City List */}
        {!loading && !error && (
          <div className="city-list">
            {filteredCities.length === 0 ? (
              <p className="not-found">City not found</p>
            ) : (
              filteredCities.map((city, idx) => (
                <div
                  key={idx}
                  className="city-item"
                  onClick={() => {
                    onSelect(city);
                    onClose();
                  }}
                >
                  {city}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
