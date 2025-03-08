import React, { useState, useRef } from 'react';
import { MapContainer, TileLayer, GeoJSON, useMapEvents, Marker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import axios from 'axios';
import L from 'leaflet';
import './App.css';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const ORS_API_KEY = process.env.REACT_APP_ORS_API_KEY;
const ORS_API_URL = 'https://api.openrouteservice.org/v2/isochrones';

const TRANSPORT_MODES = [
  { id: 'foot-walking', label: 'Walking', speed: 3 },
  { id: 'cycling-regular', label: 'Biking', speed: 9 },
  { id: 'driving-car', label: 'Driving', speed: 30 }
];

const App = () => {
  const [isochrones, setIsochrones] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [travelTime, setTravelTime] = useState('15');
  const [pendingLocation, setPendingLocation] = useState(null);
  const [transportMode, setTransportMode] = useState('foot-walking');
  
  const timeInputRef = useRef(null);

  const calculateIsochrones = async (location) => {
    setLoading(true);
    setError(null);
    setIsochrones(null);

    try {
      if (!ORS_API_KEY) {
        throw new Error('OpenRouteService API key is not configured');
      }

      const timeValue = parseInt(travelTime, 10);
      const requestBody = {
        locations: [[location[1], location[0]]],
        range: [timeValue * 30, timeValue * 60],
        range_type: 'time',
        location_type: 'start',
        units: 'mi',
        attributes: ['area'],
        smoothing: 15
      };

      const response = await axios({
        method: 'post',
        url: `${ORS_API_URL}/${transportMode}`,
        data: requestBody,
        headers: {
          'Authorization': ORS_API_KEY,
          'Content-Type': 'application/json; charset=utf-8',
          'Accept': 'application/json, application/geo+json'
        }
      });

      if (response.data?.features?.length > 0) {
        setIsochrones(response.data);
      } else {
        setError('Failed to calculate reachable areas');
      }
    } catch (err) {
      console.error('Error calculating isochrones:', err);
      if (err.response?.data?.error) {
        setError(`API Error: ${err.response.data.error.message || err.response.data.error}`);
      } else if (err.message.includes('Network Error')) {
        setError('Network error. Please check your internet connection and try again.');
      } else if (err.response?.status === 500) {
        setError('Server error. The location might be outside the supported area. Please try a different location.');
      } else {
        setError('Failed to calculate travel area. Please try again or choose a different location.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCalculate = () => {
    if (pendingLocation) {
      const timeValue = Math.min(Math.max(parseInt(travelTime, 10) || 15, 1), 120);
      setTravelTime(timeValue.toString());
      calculateIsochrones([pendingLocation.lat, pendingLocation.lng]);
    }
  };

  const MapClickHandler = () => {
    useMapEvents({
      click: (e) => {
        setPendingLocation(e.latlng);
        setIsochrones(null);
        setError(null);
      },
    });
    return null;
  };

  const handleTimeChange = (e) => {
    const value = e.target.value.replace(/\D/g, '');
    setTravelTime(value);
    setTimeout(() => timeInputRef.current?.focus(), 0);
  };

  return (
    <div className="map-wrapper">
      <MapContainer
        center={[51.5074, -0.1278]}
        zoom={13}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a> contributors"
        />
        <MapClickHandler />
        {pendingLocation && (
          <Marker position={[pendingLocation.lat, pendingLocation.lng]} />
        )}
        {isochrones && isochrones.features.map((feature, index) => (
          <GeoJSON
            key={index}
            data={{
              type: 'FeatureCollection',
              features: [feature]
            }}
            className={`isochrone ${index === 0 ? 'isochrone-inner' : 'isochrone-outer'}`}
          />
        ))}
      </MapContainer>

      <div className="control-panel">
        <h3>Travel Time Map</h3>
        <p>Click anywhere on the map to select a starting point</p>
        <div className="controls">
          <div className="transport-toggle">
            {TRANSPORT_MODES.map(mode => (
              <button
                key={mode.id}
                onClick={() => setTransportMode(mode.id)}
                className={transportMode === mode.id ? 'active' : ''}
              >
                {mode.label}
              </button>
            ))}
          </div>

          <div className="time-input">
            <label htmlFor="travelTime">Travel time:</label>
            <input
              id="travelTime"
              type="text"
              value={travelTime}
              onChange={handleTimeChange}
              ref={timeInputRef}
            />
            <span>minutes</span>
          </div>
        </div>

        {pendingLocation && (
          <p className="location-display">
            Selected location: {pendingLocation.lat.toFixed(6)}, {pendingLocation.lng.toFixed(6)}
          </p>
        )}
        <button 
          className="button"
          onClick={handleCalculate} 
          disabled={!pendingLocation || loading}
        >
          {loading ? 'Calculating...' : 'Calculate Travel Area'}
        </button>
        <p>
          Assumes {TRANSPORT_MODES.find(mode => mode.id === transportMode)?.label.toLowerCase()} speed of{' '}
          {TRANSPORT_MODES.find(mode => mode.id === transportMode)?.speed} mph
        </p>
        {error && <p className="error-message">{error}</p>}
      </div>
    </div>
  );
};

export default App; 