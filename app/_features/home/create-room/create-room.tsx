import { useCreateRoom } from './useCreateRoom';

export default function CreateRoom() {
  const { createRoom } = useCreateRoom();

  return (
    <section className="max-w-xl lg:max-w-lg">
      <h2 className="text-3xl font-bold tracking-wide lg:text-4xl">
        Conference room for real-time video and audio calls
      </h2>
      <p className="mt-4 text-base text-neutral-400 lg:text-lg">
        The alternative for Google Meet and Zoom video and audio calls. Get
        started now by creating a room or join to other rooms with room code.
      </p>
      <button
        className="mt-8 w-full rounded-md border border-red-700 bg-red-700 px-6 py-2 text-sm font-medium lg:w-auto"
        onClick={createRoom}
      >
        Create a new room
      </button>
    </section>
  );
}
