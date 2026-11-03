// Splits a paragraph into its point and its detail: the first sentence is
// bright and heavier so the eye lands on it; the rest is smaller and
// quieter, there for anyone who wants it.
export default function Lead({
  text,
  className = "text-white",
}: {
  text: string;
  className?: string;
}) {
  const m = /[.?!] /.exec(text);
  const i = m ? m.index : -1;
  if (i < 0) return <strong className={`font-medium ${className}`}>{text}</strong>;
  return (
    <>
      <strong className={`font-medium ${className}`}>
        {text.slice(0, i + 1)}
      </strong>
      <span className="block pt-1 text-[0.88em] opacity-75">
        {text.slice(i + 2)}
      </span>
    </>
  );
}
