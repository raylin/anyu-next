type SituationChipsProps = {
  chips: readonly string[];
};

export function SituationChips({ chips }: SituationChipsProps) {
  return (
    <div className="anyu-chip-list" aria-label="情境類型">
      {chips.map((chip) => (
        <button key={chip} type="button" className="anyu-chip" disabled>
          {chip}
        </button>
      ))}
    </div>
  );
}
