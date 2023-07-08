export default function HomeJoin() {
  return (
    <form className="w-full max-w-xl rounded-md bg-neutral-800 p-6 shadow-md">
      <h3 className="text-xl font-semibold tracking-wide">Join a room</h3>
      <p className="mt-2 text-base text-neutral-400">
        Have a room code? Enter the code below in order to join to other rooms.
      </p>
      <div className="mt-8 flex flex-1 items-center justify-between gap-4">
        <input
          type="text"
          className="flex-1 rounded-md border border-neutral-600 bg-neutral-800 px-4 py-2 text-sm outline-none placeholder:text-neutral-500 focus:border-neutral-500"
          placeholder="Enter a room code"
        />
        <button className="text-sm font-medium">Join</button>
      </div>
    </form>
  );
}
