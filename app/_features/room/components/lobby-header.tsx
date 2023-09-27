export default function LobbyHeader({ pageId }: { pageId: string }) {
  return (
    <>
      <h2 className="text-xs font-medium uppercase tracking-tight text-neutral-400">
        Room ID
      </h2>
      <b className="block text-2xl font-bold">{pageId}</b>
      <div className="mt-10">
        <h3 className="font-medium">You are about to enter this room</h3>
        <p className="mt-0.5 text-sm text-neutral-400">
          Anyone with the link or room ID can enter this room. Make sure your
          device camera and microphone are working properly.
        </p>
      </div>
    </>
  );
}
