interface ScoreBadgeProps {
  score: number | null | undefined;
  classification: string | null | undefined;
  showScore?: boolean;
  size?: "sm" | "md" | "lg";
}

export default function ScoreBadge({
  score,
  classification,
  showScore = true,
  size = "md",
}: ScoreBadgeProps) {
  const paddingY = size === "lg" ? "4px" : "2px";
  const paddingX = size === "lg" ? "10px" : "8px";
  const fontSize = size === "lg" ? "12px" : "11px";

  if (score === null || score === undefined) {
    return (
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          border: "1px solid #E8E8E8",
          color: "#999999",
          backgroundColor: "#FFFFFF",
          borderRadius: "4px",
          fontSize,
          padding: `${paddingY} ${paddingX}`,
          fontFamily: '"DM Sans", sans-serif',
          fontWeight: 400,
        }}
      >
        Not scored
      </span>
    );
  }

  const isHot  = classification === "hot";
  const isWarm = classification === "warm";
  const isCold = classification === "cold";

  let backgroundColor = "#6B7280";
  if (isHot)  backgroundColor = "#DC2626";
  if (isWarm) backgroundColor = "#D97706";

  const label = isHot ? "Hot" : isWarm ? "Warm" : isCold ? "Cold" : classification ?? "";

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "4px",
        backgroundColor,
        color: "#FFFFFF",
        border: "none",
        borderRadius: "4px",
        fontSize,
        padding: `${paddingY} ${paddingX}`,
        fontFamily: '"DM Sans", sans-serif',
        fontWeight: 500,
      }}
    >
      {showScore && <span>{score}</span>}
      {label && <span>{label}</span>}
    </span>
  );
}
