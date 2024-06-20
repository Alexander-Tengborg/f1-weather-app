import './App.css'

import data from '../Formula_1_calendar.json'
import { FC, useEffect, useState } from 'react';

//URL with 15 mins and hourly updates
//https://api.open-meteo.com/v1/forecast?latitude=41.570025339712245&longitude=2.2612133809186843&minutely_15=temperature_2m,rain&hourly=temperature_2m,precipitation_probability,rain&timezone=GMT&start_date=2024-06-21&end_date=2024-06-23

//URL with hourly updates
//https://api.open-meteo.com/v1/forecast?latitude=41.570025339712245&longitude=2.2612133809186843&hourly=temperature_2m,precipitation_probability,rain&timezone=GMT&start_date=2024-06-21&end_date=2024-06-23

interface Session {
  session_type: string;
  start: string;
  end: string;
}

interface GrandPrix {
  race: string;
  country: string;
  location: {
    latitude: number;
    longitude: number;
  };
  start: string;
  end: string;
  sessions: Session[];
}

interface Weather {
  race: string;
  date: string;
  hourly: {
    precipitation_probability: number[];
    rain: number[];
    temperature_2m: number[];
    time: string[];
  }
}

const App: FC = () => {
  const [grand_prix, setGrandPrix] = useState<GrandPrix | null>(null);
  const [weather_data, setWeatherData] = useState<Weather | null>(null);

  const fetchWeatherData = async () => {
    if(!grand_prix)
      return;

    console.log("Fetching weather data...")

    const url = `https://api.open-meteo.com/v1/forecast?latitude=${grand_prix.location.latitude}&longitude=${grand_prix.location.longitude}&hourly=temperature_2m,precipitation_probability,rain&timezone=GMT&start_date=${grand_prix.start.split('T')[0]}&end_date=${grand_prix.end.split('T')[0]}`;
    
    const response = await fetch(url);
    const weather = await response.json();

    console.log("Weather data fetched.")

    const weather_obj = {
      race: grand_prix.race,
      date: new Date().toISOString(),
      hourly: weather.hourly
    }

    setWeatherData(weather_obj);
    localStorage.setItem('weather_data', JSON.stringify(weather_obj));
  }

  const getCurrentData = () => {
    let current_data;
    let i = 0;

    do {
      current_data = data[i++];
    } while(Date.now() > Date.parse(current_data.end));

    return current_data;
  }

  useEffect(() => {
    const current_data = getCurrentData();

    setGrandPrix(current_data);
  }, [])

  useEffect(() => {
    if(grand_prix) {
      const weather_string = localStorage.getItem('weather_data');

      if(weather_string) {
        const weather_object = JSON.parse(weather_string);

        if(weather_object.race != grand_prix.race || (Date.now() - Date.parse(weather_object.date)) > 1000*60*5) { //5 minutes
          fetchWeatherData();
        } else {
          setWeatherData(weather_object);
        }
      } else {
        fetchWeatherData();
      }
    } 
  }, [grand_prix]);


  if(!weather_data)
    return <h1>No weather data :(</h1>

  if(!grand_prix)
    return <h1>No grand prix data :(</h1>

  return (
      <div className="card">
        <h3>{grand_prix.race}</h3>
        <h5>{grand_prix.country}, Friday {grand_prix.start.split('T')[0]} to Sunday {grand_prix.end.split('T')[0]}</h5>
        {grand_prix.sessions.map((session) => 
          <h3>{session.session_type}, {session.start}, {session.end}</h3>
        )}
      </div>
  )
}

export default App;