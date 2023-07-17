import JoinField from './join-field';

export default function JoinRoom() {
  return (
    <form className="w-full max-w-xl rounded-md bg-neutral-800 p-6 shadow-md">
      <h3 className="text-xl font-semibold tracking-wide">Join a room</h3>
      <p className="mt-2 text-base text-neutral-400">
        Have a room code? Enter the code below in order to join to other rooms.
      </p>
      <JoinField />
    </form>
  );
}
