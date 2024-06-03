import { useAuthContext } from '@/_shared/contexts/auth';
import { EventType } from '@/_shared/types/event';
import { InternalApiFetcher } from '@/_shared/utils/fetcher';
import { Button, Link } from '@nextui-org/react';
import { useEffect, useState } from 'react';

export default function NotEndedWebinarMessage() {
  const { user } = useAuthContext();
  const [resp, setResp] = useState<EventType.ListEventsResponse | null>(null);

  useEffect(() => {
    if (user) {
      InternalApiFetcher.get('/api/events/not-ended?limit=1')
        .catch((err) => {
          console.error(`Error fetching not-ended events: ${err}`);
        })
        .then((res: EventType.ListEventsResponse) => {
          setResp(res);
        });
    }
  }, [user]);

  if (resp != undefined && resp.code == 200) {
    return (
      <div className="flex flex-row items-center justify-between rounded-xl bg-blue-900/25 p-2 ring-1 ring-blue-300/50">
        <p className="px-2 text-sm text-blue-300 md:px-4">
          You have an ongoing webinar that should be ended
        </p>

        <Button
          as={Link}
          href={
            resp.data.length == 1
              ? `/events/${resp.data[0].slug}/detail`
              : '/not-ended-events/'
          }
          className="h-auto min-h-0 min-w-0 rounded-lg bg-zinc-800/50 px-4 py-2.5 antialiased hover:bg-zinc-800 active:bg-zinc-700"
        >
          View
        </Button>
      </div>
    );
  }
}
