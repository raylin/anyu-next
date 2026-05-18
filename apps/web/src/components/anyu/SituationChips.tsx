type SituationChipsProps = {
  chips: readonly string[];
  selectedChip?: string;
  onSelect?: (chip: string) => void;
};

export function SituationChips({
  chips,
  selectedChip,
  onSelect,
}: SituationChipsProps) {
  return (
    <div className="anyu-chip-list" role="group" aria-label="情境類型">
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
