type SituationChipsProps = {
  chips: readonly string[];
  selectedChip?: string;
  onSelect?: (chip: string) => void;
  ariaLabel?: string;
};

export function SituationChips({
  chips,
  selectedChip,
  onSelect,
  ariaLabel = "情境類型",
}: SituationChipsProps) {
  return (
    <div className="anyu-chip-list" role="group" aria-label={ariaLabel}>
      {chips.map((chip) => (
        <button
          key={chip}
          type="button"
          className={[
            "anyu-chip",
            selectedChip === chip ? "anyu-chip-active" : "",
          ]
            .filter(Boolean)
            .join(" ")}
          aria-pressed={selectedChip === chip}
          onClick={() => onSelect?.(chip)}
        >
          {chip}
        </button>
      ))}
    </div>
  );
}
