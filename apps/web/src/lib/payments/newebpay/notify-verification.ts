import crypto from "node:crypto";
import { NEWEBPAY_MPG_VERSION, createNewebPayTradeSha } from "@/lib/payments/newebpay/checkout-payload";
import type { NewebPayConfig } from "@/lib/payments/newebpay/config";

export type NewebPayNotifyError =
  | "malformed_payload"
  | "signature_missing"
  | "signature_invalid"
  | "trade_info_decrypt_failed"
  | "merchant_mismatch";

export type VerifiedNewebPayNotify = {
  merchantOrderNo: string;
  amountMinor: number;
  status: string;
  responseCode: string | null;
  tradeNo: string | null;
  paymentType: string | null;
  messageCategory: string | null;
  paidAt: Date | null;
};

export type VerifyNewebPayNotifyResult =
  | { ok: true; event: VerifiedNewebPayNotify }
  | { ok: false; error: NewebPayNotifyError };

function readString(value: FormDataEntryValue | string | undefined | null) {
  return typeof value === "string" ? value.trim() : "";
}

function decryptTradeInfo(tradeInfo: string, config: Extract<NewebPayConfig, { ok: true }>) {
  const decipher = crypto.createDecipheriv("aes-256-cbc", config.hashKey, config.hashIv);
  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(tradeInfo, "hex")),
    decipher.final(),
  ]);

  return decrypted.toString("utf8");
}

function parseTradeInfoJson(decrypted: string) {
  const parsed = JSON.parse(decrypted) as unknown;

  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    return null;
  }

  return parsed as Record<string, unknown>;
}

function readResultObject(payload: Record<string, unknown>) {
  const result = payload.Result;

  if (!result || typeof result !== "object" || Array.isArray(result)) {
    return null;
  }

  return result as Record<string, unknown>;
}

function parsePaidAt(value: unknown) {
  if (typeof value !== "string" || !value.trim()) {
    return null;
  }

  const normalized = value.includes("T") ? value : value.replace(" ", "T");
  const parsed = new Date(normalized);

  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function verifyNewebPayNotifyPayload(
  payload: FormData | Record<string, string | undefined>,
  config: Extract<NewebPayConfig, { ok: true }>,
): VerifyNewebPayNotifyResult {
  const getValue = (key: string) =>
    payload instanceof FormData ? payload.get(key) : payload[key];
  const merchantId = readString(getValue("MerchantID"));
  const tradeInfo = readString(getValue("TradeInfo"));
  const tradeSha = readString(getValue("TradeSha"));
  const version = readString(getValue("Version"));

  if (!merchantId || !tradeInfo) {
    return { ok: false, error: "malformed_payload" };
  }

  if (!tradeSha) {
    return { ok: false, error: "signature_missing" };
  }

  if (merchantId !== config.merchantId) {
    return { ok: false, error: "merchant_mismatch" };
  }

  if (version && version !== NEWEBPAY_MPG_VERSION) {
    return { ok: false, error: "malformed_payload" };
  }

  if (createNewebPayTradeSha(tradeInfo, config) !== tradeSha.toUpperCase()) {
    return { ok: false, error: "signature_invalid" };
  }

  let decrypted: string;
  let decoded: Record<string, unknown> | null;

  try {
    decrypted = decryptTradeInfo(tradeInfo, config);
    decoded = parseTradeInfoJson(decrypted);
  } catch {
    return { ok: false, error: "trade_info_decrypt_failed" };
  }

  if (!decoded) {
    return { ok: false, error: "trade_info_decrypt_failed" };
  }

  const result = readResultObject(decoded);
  const merchantOrderNo = typeof result?.MerchantOrderNo === "string" ? result.MerchantOrderNo : "";
  const amt = typeof result?.Amt === "string" || typeof result?.Amt === "number" ? Number(result.Amt) : NaN;
  const status = typeof decoded.Status === "string" ? decoded.Status : "";

  if (!merchantOrderNo || !Number.isFinite(amt) || !status) {
    return { ok: false, error: "malformed_payload" };
  }

  return {
    ok: true,
    event: {
      merchantOrderNo,
      amountMinor: amt,
      status,
      responseCode: typeof result?.RespondCode === "string" ? result.RespondCode : null,
      tradeNo: typeof result?.TradeNo === "string" ? result.TradeNo : null,
      paymentType: typeof result?.PaymentType === "string" ? result.PaymentType : null,
      messageCategory: typeof decoded.Message === "string" ? decoded.Message : null,
      paidAt: parsePaidAt(result?.PayTime),
    },
  };
}

