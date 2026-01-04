const API_KEY = 'c1e2a8b8ccd8bbb6e6b38cf33ee0609c'; // <-- replace with your real key

export async function getWeather(city) {
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${API_KEY}`;
  console.log('🔍 calling:', url);          // <-- add this
  const response = await fetch(url);
  console.log('📡 HTTP status:', response.status); // <-- add this
  const text = await response.text();       // <-- read raw text first
  console.log('📦 raw answer:', text);      // <-- add this

  if (!response.ok) {
    // try to read JSON error, fallback to raw text
    let msg = text;
    try {
      const json = JSON.parse(text);
      msg = json.message || 'City not found';
    } catch {}
    throw new Error(msg);
  }

  const data = JSON.parse(text);
  return {
    name: data.name,
    temp: data.main.temp,
    description: data.weather[0].description,
    icon: data.weather[0].icon,
  };
}

export async function getForecast(city) {
  const url = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=${API_KEY}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Forecast not found');
  const data = await res.json();

  // group into daily min/max (simple way)
  const daily = {};
  data.list.forEach((item) => {
    const date = item.dt_txt.split(' ')[0]; // "2025-12-15"
    if (!daily[date]) {
      daily[date] = { min: item.main.temp_min, max: item.main.temp_max, icon: item.weather[0].icon };
    } else {
      daily[date].min = Math.min(daily[date].min, item.main.temp_min);
      daily[date].max = Math.max(daily[date].max, item.main.temp_max);
    }
  });

  // convert to array, take first 5 days
  return Object.keys(daily)
    .slice(0, 5)
    .map((date) => ({
      day: new Date(date).toLocaleDateString(undefined, { weekday: 'short' }),
      min: Math.round(daily[date].min),
      max: Math.round(daily[date].max),
      icon: daily[date].icon,
    }));
}