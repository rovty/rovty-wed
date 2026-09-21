/** Small original vector details, kept crisp at every preview and screen size. */
export function TemplateOrnament({
  kind,
}: {
  kind: "branch" | "sun" | "flower" | "fan" | "arch";
}) {
  return (
    <svg
      className={`template-ornament ornament-${kind}`}
      viewBox="0 0 200 200"
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
      aria-hidden="true"
    >
      {kind === "branch" ? (
        <>
          <path d="M40 190Q130 100 145 10M90 122Q24 104 31 54Q84 59 90 122M112 88Q161 104 185 61Q141 47 112 88M128 58Q79 51 91 15Q130 23 128 58M62 158Q7 157 13 119Q52 122 62 158" />
          <path d="M90 122L44 69M112 88L171 66M128 58L98 25M62 158L23 130" />
        </>
      ) : kind === "sun" ? (
        <>
          <circle cx="100" cy="100" r="36" />
          <circle cx="100" cy="100" r="29" />
          {Array.from({ length: 24 }, (_, i) => (
            <path
              key={i}
              d="M100 12V51"
              transform={`rotate(${i * 15} 100 100)`}
            />
          ))}
        </>
      ) : kind === "flower" ? (
        <>
          {Array.from({ length: 8 }, (_, i) => (
            <ellipse
              key={i}
              cx="100"
              cy="59"
              rx="19"
              ry="40"
              transform={`rotate(${i * 45} 100 100)`}
            />
          ))}
          <circle cx="100" cy="100" r="13" />
        </>
      ) : kind === "fan" ? (
        <>
          {Array.from({ length: 9 }, (_, i) => (
            <path
              key={i}
              d={`M100 180L${20 + i * 20} ${20 + Math.abs(4 - i) * 14}`}
            />
          ))}
          <path d="M20 76L40 62L60 48L80 34L100 20L120 34L140 48L160 62L180 76M30 106L100 57L170 106M48 128L100 91L152 128" />
        </>
      ) : (
        <>
          <path d="M28 189V96Q28 48 100 12Q172 48 172 96V189M41 189V100Q41 58 100 27Q159 58 159 100V189M54 189V105Q54 69 100 43Q146 69 146 105V189" />
          <path d="M18 189H182M100 12V0" />
        </>
      )}
    </svg>
  );
}
