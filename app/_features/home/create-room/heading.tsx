export default function Heading({ text }: { text: string }) {
  return (
    <h2 className="text-3xl font-bold tracking-wide lg:text-4xl">{text}</h2>
  );
}
