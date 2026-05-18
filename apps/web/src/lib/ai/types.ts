export type AnalyzeRequest = {
  moduleId: string;
  input: string;
};

export type AnalyzeResponse = {
  ok: boolean;
  error?: string;
  resultId?: string;
};
