import { useAuthContext } from '@/_shared/contexts/auth';
import { FetcherResponse, InternalApiFetcher } from '@/_shared/utils/fetcher';
import { Button } from '@nextui-org/react';

export default async function NotEndedWebinarMessage() {
  const { user } = useAuthContext();

  if (!user) return;

  const resp: FetcherResponse = await InternalApiFetcher.get(
    '/api/events/not-ended'
  );

  if (resp.code == 200) {
    return (
      <div className="flex flex-row justify-between bg-blue-900/25">
        <p className="text-sm text-blue-300">
          You have ongoing events that should be ended
        </p>
        <Button className="h-auto min-h-0 min-w-0 rounded-lg bg-zinc-800/50 px-4 py-2.5 antialiased hover:bg-zinc-800 active:bg-zinc-700">
          View
        </Button>
      </div>
    );
  }
}
