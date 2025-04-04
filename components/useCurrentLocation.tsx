import { useEffect, useState } from "react";

export function useCurrentLocation(){
    const [location, setLocation] = useState<[number, number] | null>(null);
    useEffect(()=>{
        if(navigator.geolocation){
            navigator.geolocation.getCurrentPosition((pos)=>{
                const {latitude, longitude} = pos.coords;
                setLocation([latitude, longitude]);
            });
        }
    },[]);
    return location;
}