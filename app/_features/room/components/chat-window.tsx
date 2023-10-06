export default function ChatWindowBody() {
  return (
    <div>
      <Chat></Chat>
      <Chat></Chat>
      <Chat></Chat>
      <Chat></Chat>
      <Chat></Chat>
    </div>
  );
}

function Chat() {
  return (
    <div className="inline-flex  flex-col items-start justify-start">
      <div className="inline-flex items-center justify-start">
        <div className="flex space-x-4">
          <div className="flex-auto self-center font-semibold leading-tight text-rose-300">
            Gagah Ghaniswara
          </div>
          <div className="flex-none  self-center font-normal text-zinc-400">
            12:36 PM
          </div>
        </div>
      </div>
      <div className="self-stretch font-normal  text-zinc-100">
        Thanks! I will check on that
      </div>
    </div>
  );
}
