import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { useStateContext } from '@/context/state-context';

export default function LocationDialog() {
  const { location, setLocation } = useStateContext();

  return (
    <>
      <Dialog open={!!location} onOpenChange={() => setLocation(undefined)}>
        <DialogContent className='max-w-[90dvw] gap-2 rounded-lg md:max-w-lg'>
          {location && (
            <>
              <DialogHeader>
                <DialogTitle>{location.applicant}</DialogTitle>
              </DialogHeader>

              <Separator />

              <div className='space-y-2 text-center'>
                <p>
                  Located at <span className='font-medium'>{location.address}</span>
                </p>
                <p className='text-sm text-neutral-800'>{location.locationDescription}</p>

                <Button size='sm' variant='link' asChild>
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${location.position.lat},${location.position.lng}`}
                    target='_blank'
                  >
                    Open in Google Maps
                    <svg
                      xmlns='http://www.w3.org/2000/svg'
                      viewBox='0 0 256 367'
                      className='ms-1 size-5'
                    >
                      <path
                        fill='#34a853'
                        d='M70.585 271.865a370.712 370.712 0 0 1 28.911 42.642c7.374 13.982 10.448 23.463 15.837 40.31c3.305 9.308 6.292 12.086 12.714 12.086c6.998 0 10.173-4.726 12.626-12.035c5.094-15.91 9.091-28.052 15.397-39.525c12.374-22.15 27.75-41.833 42.858-60.75c4.09-5.354 30.534-36.545 42.439-61.156c0 0 14.632-27.035 14.632-64.792c0-35.318-14.43-59.813-14.43-59.813l-41.545 11.126l-25.23 66.451l-6.242 9.163l-1.248 1.66l-1.66 2.078l-2.914 3.319l-4.164 4.163l-22.467 18.304l-56.17 32.432z'
                      />
                      <path
                        fill='#fbbc04'
                        d='M12.612 188.892c13.709 31.313 40.145 58.839 58.031 82.995l95.001-112.534s-13.384 17.504-37.662 17.504c-27.043 0-48.89-21.595-48.89-48.825c0-18.673 11.234-31.501 11.234-31.501l-64.489 17.28z'
                      />
                      <path
                        fill='#4285f4'
                        d='M166.705 5.787c31.552 10.173 58.558 31.53 74.893 63.023l-75.925 90.478s11.234-13.06 11.234-31.617c0-27.864-23.463-48.68-48.81-48.68c-23.969 0-37.735 17.475-37.735 17.475v-57z'
                      />
                      <path
                        fill='#1a73e8'
                        d='M30.015 45.765C48.86 23.218 82.02 0 127.736 0c22.18 0 38.89 5.823 38.89 5.823L90.29 96.516H36.205z'
                      />
                      <path
                        fill='#ea4335'
                        d='M12.612 188.892S0 164.194 0 128.414c0-33.817 13.146-63.377 30.015-82.649l60.318 50.759z'
                      />
                    </svg>
                  </a>
                </Button>
              </div>

              <Separator />

              <div className='flex flex-wrap justify-center gap-2'>
                {location.tags
                  .split(':')
                  .map((tag) => tag.trim())
                  .map((tag, i) => (
                    <div
                      key={i}
                      className='rounded bg-border px-1.5 py-0.5 text-sm font-medium lowercase text-foreground shadow-sm'
                    >
                      {tag}
                    </div>
                  ))}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
