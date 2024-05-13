import LocationDialog from '@/app/location-dialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useStateContext } from '@/context/state-context';
import { Location, Position } from '@/lib/models/location';
import { calculateDistance } from '@/lib/utils';
import * as csv from '@fast-csv/parse';
import { readFileSync } from 'fs';
import type { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import dynamic from 'next/dynamic';
import Head from 'next/head';
import { useEffect, useState } from 'react';
import * as R from 'remeda';
import '../styles/global.css';

const GoogleMap = dynamic(() => import('../app/map'), { ssr: false });

export const getServerSideProps = (async () => {
  const locations: Location[] = await new Promise((resolve, reject) => {
    const locations: Location[] = [];

    const stream = csv
      .parse({ headers: true })
      .on('error', reject)
      .on('data', (row) => {
        locations.push({
          id: parseInt(row['locationid']),
          applicant: row['Applicant'],
          locationDescription: row['LocationDescription'],
          address: row['Address'],
          type: row['FacilityType'],
          tags: row['FoodItems'],
          position: { lat: parseFloat(row['Latitude']), lng: parseFloat(row['Longitude']) },
          schedule: row['dayshours']?.length && row['dayshours'],
        });
      })
      .on('end', () => resolve(locations));

    const csvFile = readFileSync(process.cwd() + '/assets/data.csv');

    stream.write(csvFile);
    stream.end();
  });

  return {
    props: {
      locations: locations.filter(
        (location) => location.type === 'Truck' && location.position.lat && location.position.lng,
      ),
    },
  };
}) satisfies GetServerSideProps<{ locations: Location[] }>;

export default function Home({
  locations,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const [infoOpen, setInfoOpen] = useState(false);
  const [nearestLocation, setNearestLocation] = useState<{
    location: Location;
    path: google.maps.Polyline;
  }>();
  const [currentPosition, setCurrentLocation] = useState<{
    position: Position;
    marker: google.maps.Marker;
  }>();

  const { map, location, setLocation, showLoading, hideLoading, showAlert } = useStateContext();

  function getUserLocation(retryCount = 0) {
    return new Promise<Position>((resolve, reject) => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            console.log('resolved');
            const { latitude, longitude } = position.coords;
            resolve({ lat: latitude, lng: longitude });
          },
          (error) => {
            if (error.code === GeolocationPositionError.PERMISSION_DENIED) {
              if (retryCount > 3) {
                showAlert({
                  title: 'Location permission blocked',
                  message: (
                    <div className='text-center'>
                      <p>We couldn't get you to grant current location access.</p>
                      <p>You will not be able to get a nearest location.</p>
                    </div>
                  ),
                  type: 'error',
                  onDismiss: () => reject('Denied'),
                });
              } else {
                showAlert({
                  title: 'Location permission denied',
                  message: (
                    <div className='text-center'>
                      <p>
                        We can't open the nearest location without knowing your current location.
                      </p>
                      <p>Do you want to retry?</p>
                    </div>
                  ),
                  type: 'error',
                  confirmText: 'Retry',
                  denyText: 'Cancel',
                  onDismiss: (type) => {
                    if (type === 'confirm') {
                      getUserLocation(retryCount + 1).then(resolve, reject);
                    } else {
                      reject('Denied');
                    }
                  },
                });
              }
            }
          },
        );
      } else {
        showAlert({
          title: 'Location unavailable',
          message: (
            <div className='text-center'>
              <p>Your browser doesn't support current location access.</p>
            </div>
          ),
          type: 'error',
        });

        reject('Unsupported');
      }
    });
  }

  async function openNearest() {
    let position: Position;

    if (!currentPosition) {
      showLoading('Getting your current location');

      try {
        position = await getUserLocation();
      } finally {
        hideLoading();
      }
    } else {
      position = currentPosition.position;
    }

    const distances: { id: number; distance: number }[] = [];

    for (const location of locations) {
      const distance = calculateDistance(location.position, position);
      distances.push({ id: location.id, distance });
    }

    const nearest = R.pipe(
      distances,
      R.firstBy((item) => item.distance),
    )!;

    const nearestLocation = locations.find((location) => location.id === nearest.id)!;

    setLocation(nearestLocation);

    const path = new google.maps.Polyline({
      path: [position, nearestLocation.position],
      geodesic: true,
      strokeColor: '#213569',
      strokeOpacity: 1.0,
      strokeWeight: 2,
      map: map!,
    });

    setNearestLocation({ location: nearestLocation, path });

    const marker = new google.maps.Marker({
      position,
      map: map!,
    });

    setCurrentLocation({
      position,
      marker,
    });

    hideLoading();

    setTimeout(() => {
      const bounds = new google.maps.LatLngBounds();
      path.getPath().forEach((position) => bounds.extend(position));
      map!.fitBounds(bounds);
    }, 50);
  }

  useEffect(() => {
    if (!location || !nearestLocation) {
      return;
    }

    if (location.id !== nearestLocation.location.id) {
      nearestLocation.path.setMap(null);
      setNearestLocation(undefined);
    }
  }, [location]);

  return (
    <>
      <Head>
        <title>Food Truck Localizer</title>
        <link rel='icon' href='/favicon.png' />
      </Head>

      <div className='flex h-dvh flex-col space-y-3 bg-sky-100 p-3'>
        <div className='flex rounded-lg bg-primary px-3 py-1 shadow-md'>
          <h1 className='text-lg font-semibold text-primary-foreground md:text-xl'>
            Food Truck Localizer
          </h1>

          <button className='ms-auto text-sm font-medium text-muted' onClick={() => openNearest()}>
            Get nearest
          </button>
        </div>

        <div className='h-full w-full'>
          <div className='h-full w-full overflow-clip rounded-lg shadow-md'>
            {locations && <GoogleMap locations={locations} />}
          </div>
        </div>
      </div>

      <LocationDialog />

      {/* About dialog */}
      <Dialog open={infoOpen} onOpenChange={setInfoOpen}>
        <DialogContent className='max-w-[95dvw] rounded-lg md:max-w-lg'>
          <DialogHeader>
            <DialogTitle>About Food Truck Localizer</DialogTitle>
            <DialogDescription>
              This app will show you the locations of food trucks located in San Fransico,
              California.
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </>
  );
}
