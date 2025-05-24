import React, { useState } from "react";
import axios from "axios";
import './WeatherReport.css';

const WeatherReport = () => {
  const [cities, setCities] = useState([""]);
  const [weatherData, setWeatherData] = useState([]);
  const [error, setError] = useState("");

  const fetchCoordinates = async (city) => {
    try {
      const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${city}`;
      const geoRes = await axios.get(geoUrl);
      const location = geoRes.data.results?.[0];
      if (!location) throw new Error("City not found");
      return { lat: location.latitude, lon: location.longitude, name: location.name };
    } catch (err) {
      throw new Error(`Geocoding failed for ${city}: ${err.message}`);
    }
  };

  const fetchWeather = async () => {
    setError("");
    setWeatherData([]);

    try {
      const allData = await Promise.all(
        cities.filter(Boolean).map(async (city) => {
          const { lat, lon, name } = await fetchCoordinates(city);
          const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`;
          const weatherRes = await axios.get(weatherUrl);
          return { city: name, ...weatherRes.data.current_weather };
        })
      );
      setWeatherData(allData);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleCityChange = (index, value) => {
    const updatedCities = [...cities];
    updatedCities[index] = value;
    setCities(updatedCities);
  };

  const addCityField = () => {
    setCities([...cities, ""]);
  };

  return (
    <div className="weather-container">
      <h1>React Weather App</h1>

      {cities.map((city, index) => (
        <input
          key={index}
          type="text"
          value={city}
          onChange={(e) => handleCityChange(index, e.target.value)}
          placeholder="Enter city name"
        />
      ))}

      <button onClick={addCityField} className="add-btn">+ Add City</button>
      <button onClick={fetchWeather} className="fetch-btn">Get Weather</button>

      {error && <div className="error">Error: {error}</div>}

      {weatherData.length > 0 && (
        <div className="weather-results">
          {weatherData.map((data, idx) => (
            <div key={idx} className="weather-card">
              <h2>{data.city}</h2>
              <p>Temperature: {data.temperature}°C</p>
              <p>Windspeed: {data.windspeed} km/h</p>
              <p>Weather Code: {data.weathercode}</p>
              <p>Time: {data.time}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default WeatherReport;
