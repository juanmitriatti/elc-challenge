// 'use client'
import { Loader } from "@googlemaps/js-api-loader";
import React, { useEffect, useRef, useState } from "react";

export function Map({ markers }) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [closestLocation, setClosestLocation] = useState(null);
  const [closestFinalDistance, setClosestDistance] = useState(null);

  useEffect(() => {
    const initMap = async () => {
      // Get user's current location
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userPosition = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          console.log("userPosition : ", userPosition);
          const testingCenterPosition = { lat: 37.7533012, lng: -122.4537887 };
          // loadMap(userPosition);
         
          loadMap(testingCenterPosition);
        },
        (error) => {
          console.error("Error getting user location:", error);
          // If error occurs, default to San Francisco
          const defaultPosition = { lat: 37.7749, lng: -122.4194 };
          loadMap(defaultPosition);
        }
      );
    };

    const loadMap = async (centerPosition: google.maps.LatLngLiteral) => {
      const loader = new Loader({
        apiKey: process.env.NEXT_PUBLIC_MAPS_API_KEY as string,
        version: "weekly",
      });
      const { Map } = await loader.importLibrary("maps");
      const { Marker } = (await loader.importLibrary(
        "marker"
      )) as google.maps.MarkerLibrary;

      // Map options
      const mapOptions: google.maps.MapOptions = {
        center: centerPosition,
        zoom: 13,
        mapId: "MY_NEXTJS_MAPID",
      };

      // Setup the map
      const map = new Map(mapRef.current as HTMLDivElement, mapOptions);

      // Put up a marker for user's current location
      new Marker({
        map: map,
        position: centerPosition,
        title: "Your Location",
      });


      // Transforming the array of arrays into an array of objects
      const miscellaneousPositions = markers.map((coords) => ({
        lat: parseFloat(coords[0]), // Convert string to float for latitude
        lng: parseFloat(coords[1]), // Convert string to float for longitude
      }));

      // Place markers for miscellaneous positions
      miscellaneousPositions.forEach((position, index) => {
        new Marker({
          map: map,
          position: position,
          title: `Miscellaneous Position ${index + 1}`,
        });
      });

      let closestDistance = Infinity;
      let closestLocation = null;
      const testPosition = { lat: 37.7533012, lng: -122.4537887 };

      miscellaneousPositions.forEach((location) => {
        const distance = calculateDistance(testPosition, location);
        if (distance < closestDistance) {
          closestDistance = distance;
          closestLocation = location;
        }
      });

     setClosestDistance(closestDistance);
     setClosestLocation(closestLocation);

     const flightPlanCoordinates = [
        testPosition,
        { lat: closestLocation.lat, lng: closestLocation.lng },
      ];
      const flightPath = new google.maps.Polyline({
        path: flightPlanCoordinates,
        geodesic: true,
        strokeColor: "#FF0000",
        strokeOpacity: 1.0,
        strokeWeight: 2,
      });
    
      flightPath.setMap(map);
    };

   
    initMap();
  }, []);

  const calculateDistance = (point1, point2) => {
    const R = 6371; // Radius of the Earth in kilometers
    const lat1 = point1.lat;
    const lon1 = point1.lng;
    const lat2 = point2.lat;
    const lon2 = point2.lng;

    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) *
        Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return distance; // Distance in kilometers
  };
  return (
    <>
      <div>
        {closestLocation && closestFinalDistance && (
          <p>
            Closest Location:{" "}
            {closestLocation.lat.toFixed(2)}, {closestLocation.lng.toFixed(2)}
            <br />
              Distance:{" "}
            {closestFinalDistance.toFixed(2)} km
          </p>
        )}
      </div>
      <div style={{ height: "100vh" }} ref={mapRef} />
    </>
  );
}
