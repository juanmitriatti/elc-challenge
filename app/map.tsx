'use client';

import { useStateContext } from '@/context/state-context';
import { Location } from '@/lib/models/location';
import { APIProvider, Map, useMap } from '@vis.gl/react-google-maps';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import * as R from 'remeda';

type Marker = google.maps.Marker;

function divideArray<T>(array: T[]): T[][] {
  const result: T[][] = [];

  while (array.length) {
    const randomLength = Math.floor(Math.random() * 6) + 5;

    result.push(array.splice(0, randomLength));
  }

  return result;
}

const addDelayedMarkers = async (
  locations: Location[],
  map: google.maps.Map,
  setLocation: Dispatch<SetStateAction<Location | undefined>>,
) => {
  const markers: Marker[] = [];
  const array = divideArray(R.shuffle(locations));

  for (const arr of array) {
    for (const location of arr) {
      const marker = new google.maps.Marker();

      marker.setPosition(location.position);
      marker.setAnimation(google.maps.Animation.DROP);
      marker.setMap(map);
      marker.setClickable(true);
      marker.setValues({ id: location.id });
      marker.addListener('click', () => setLocation(location));
      markers.push(marker);
    }

    await new Promise((r) => setTimeout(r, 25));
  }

  return markers;
};

const deleteMarkers = (markers: Marker[]) => {
  for (const marker of markers) {
    marker.setMap(null);
  }
};

const Locations = ({ locations }: { locations: Location[] }) => {
  const [markers, setMarkers] = useState<Marker[]>([]);

  const [currentMarker, setCurrentMarker] = useState<Marker>();

  const { setMap, location, setLocation } = useStateContext();
  const map = useMap();

  useEffect(() => {
    if (!map) return;

    setMap(map);

    setTimeout(() => {
      addDelayedMarkers(locations, map, setLocation).then((markers) => setMarkers(markers));
    }, 100);
  }, [map]);

  useEffect(() => {
    if (!map || !location) return;

    if (currentMarker) {
      currentMarker?.setIcon();
      setCurrentMarker(undefined);
    }

    const svgMarker = {
      path: 'M12,11.5A2.5,2.5 0 0,1 9.5,9A2.5,2.5 0 0,1 12,6.5A2.5,2.5 0 0,1 14.5,9A2.5,2.5 0 0,1 12,11.5M12,2A7,7 0 0,0 5,9C5,14.25 12,22 12,22C12,22 19,14.25 19,9A7,7 0 0,0 12,2Z',
      fillColor: '#213569',
      fillOpacity: 1,
      strokeWeight: 0.5,
      rotation: 0,
      scale: 1.75,
      anchor: new google.maps.Point(12, 22),
    };

    const marker = markers.find((marker) => marker.get('id') === location.id);
    marker?.setIcon(svgMarker);
    setCurrentMarker(marker);

    map.panTo(location.position);

    if (map.getZoom()! < 15) {
      map.setZoom(Math.random() * (15.1 - 15) + 15);
    }
  }, [location]);

  useEffect(() => {
    return () => {
      console.log('dismount', markers.length);
      deleteMarkers(markers);
      setMarkers([]);
    };
  }, []);

  return <></>;
};

export default function GoogleMap({ locations }: { locations: Location[] }) {
  return (
    <>
      <APIProvider apiKey={process.env.NEXT_PUBLIC_MAPS_API_KEY!}>
        <Map
          style={{ width: '100%', height: '100%', outline: 'none' }}
          defaultCenter={{ lat: 37.735, lng: -122.45 }}
          defaultZoom={12}
          gestureHandling={'greedy'}
          disableDefaultUI={true}
        />
        <Locations locations={locations} />
      </APIProvider>
    </>
  );
}
