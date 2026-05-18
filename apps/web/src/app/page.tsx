import { Wordmark } from "@/components/anyu/Wordmark";
import { Button } from "@/components/anyu/Button";
import { Card } from "@/components/anyu/Card";

export default function Home() {
  return (
    <main className="anyu-shell">
      <section className="anyu-hero">
        <Wordmark />
        <Card>
          <span className="anyu-kicker">C-stage foundation</span>
          <h1 className="anyu-title">暗語 ANYU</h1>
          <p className="anyu-copy">
            C-stage production foundation is being prepared.
          </p>
          <Button asChild href="/m/ambiguous-temperature">
            前往 曖昧溫度計 模組骨架
          </Button>
        </Card>
      </section>
    </main>
  );
}
