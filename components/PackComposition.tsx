export default function PackComposition({ lines }: { lines: string[] }) {
  if (lines.length === 0) return null;
  return (
    <ul className="space-y-2">
      {lines.map((line, i) => {
        const equivalent = /\(ou équivalent\)/i.test(line);
        const clean = line.replace(/\(ou équivalent\)/i, '').trim();
        return (
          <li key={i} className="flex gap-3 text-sm">
            <span
              className="mt-2 inline-block w-1.5 h-1.5 rounded-full bg-kb-bordeaux flex-shrink-0"
              aria-hidden
            />
            <span>
              <span className="text-kb-ink">{clean}</span>
              {equivalent && (
                <span className="ml-2 italic text-kb-olive text-xs">
                  ou équivalent
                </span>
              )}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
