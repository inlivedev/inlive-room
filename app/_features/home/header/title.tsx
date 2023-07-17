export default function Title({ text }: { text: string }) {
  return (
    <h1 className="text-lg font-semibold tracking-wide lg:text-xl">{text}</h1>
  );
}
