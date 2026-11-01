// Sets a paragraph's first sentence as its lead: brighter and a touch
// heavier, so the eye reads the point first and the rest as detail.
export default function Lead({
  text,
  className = "text-white",
}: {
  text: string;
  className?: string;
}) {
  const i = text.indexOf(". ");
  if (i < 0) return <>{text}</>;
  return (
    <>
      <strong className={`font-medium ${className}`}>
        {text.slice(0, i + 1)}
      </strong>
      {text.slice(i + 1)}
    </>
  );
}
