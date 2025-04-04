export async function fetchWeather(lat: number, lon: number): Promise<any> {
    const apiKey = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY;
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
  
    const res = await fetch(url);
    if (!res.ok) throw new Error('Weather fetch failed');
    return res.json();
  }