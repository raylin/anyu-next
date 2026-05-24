import Link from "next/link";
import { notFound } from "next/navigation";
import { Card } from "@/components/anyu/Card";
import { AiTemperatureResult } from "@/components/modules/ai-temperature/AiTemperatureResult";
import { normalizeProductResultForDisplay } from "@/lib/ai/product-result-schema";
import { isDbConfigured } from "@/lib/db/client";
import { getAnalysisResultRecordById } from "@/lib/db/runtime";
import {
  getAiTemperatureDemoResult,
  mapProductResultToViewModel,
} from "@/lib/modules/ai-temperature-ui";
import { getModuleBySlug } from "@/lib/modules/registry";

type ResultPageProps = {
  params: Promise<{
    moduleSlug: string;
    resultId: string;
  }>;
};

export default async function ResultPage({ params }: ResultPageProps) {
  const { moduleSlug, resultId } = await params;
  const moduleConfig = getModuleBySlug(moduleSlug);

  if (!moduleConfig) {
    notFound();
  }

  if (resultId === "demo") {
    return (
      <main className="anyu-shell">
        <AiTemperatureResult
          moduleConfig={moduleConfig}
          result={getAiTemperatureDemoResult()}
          mode="demo"
          resultId="demo"
        />
      </main>
    );
  }

  if (!isDbConfigured()) {
    return (
      <main className="anyu-shell">
        <Card>
          <p className="anyu-kicker">Result unavailable</p>
          <h1 className="anyu-section-title">目前分析服務尚未設定完成</h1>
          <p className="anyu-copy">這份結果暫時無法載入，請稍後再試，或先查看 demo 結果。</p>
          <Link href={`/m/${moduleConfig.slug}/result/demo`} className="anyu-back-link">
            前往 demo 結果
          </Link>
        </Card>
      </main>
    );
  }

  const record = await getAnalysisResultRecordById(
    resultId,
    moduleConfig.moduleId,
    moduleConfig.slug,
  );

  if (!record) {
    return (
      <main className="anyu-shell">
        <Card>
          <p className="anyu-kicker">Result not found</p>
          <h1 className="anyu-section-title">找不到這份結果</h1>
          <p className="anyu-copy">這份分析可能已過期，或是連結不完整。</p>
          <Link href={`/m/${moduleConfig.slug}`} className="anyu-back-link">
            回到輸入頁
          </Link>
        </Card>
      </main>
    );
  }

  const normalizedResult = normalizeProductResultForDisplay(record.normalizedResultJson);

  return (
    <main className="anyu-shell">
      <AiTemperatureResult
        moduleConfig={moduleConfig}
        result={mapProductResultToViewModel(normalizedResult)}
        mode="runtime"
        resultId={record.id}
      />
    </main>
  );
}
