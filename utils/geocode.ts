export async function searchLocation(query:string): Promise<[number, number]|null> {
    const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${query}`);
    const data = await res.json();
    if(data.length > 0){
        return [parseFloat(data[0].lat), parseFloat(data[0].lon)];
    }
    return null;
}

export async function getCoordsByName(name: string): Promise<[number, number] | null> {
    const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(name + ', Casablanca')}`);
    const data = await res.json();
    if (data.length === 0) return null;
    return [parseFloat(data[0].lat), parseFloat(data[0].lon)];
  }
  