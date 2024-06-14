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
      InternalApiFetcher.get('/api/events/not-ended')
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
      <div className="flex flex-row items-center justify-between rounded-xl bg-blue-900/25 p-3 ring-1 ring-blue-300/50">
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
          className="h-7 rounded bg-transparent px-3 text-xs font-medium text-blue-300"
        >
          View
        </Button>
      </div>
    );
  }
}
