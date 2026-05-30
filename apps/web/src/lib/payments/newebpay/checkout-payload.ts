import crypto from "node:crypto";
import type { NewebPayConfig } from "@/lib/payments/newebpay/config";

export const NEWEBPAY_MPG_VERSION = "2.0";
const NEWEBPAY_AES_PADDING_BLOCK_SIZE = 32;

export type NewebPayCheckoutContract = {
  actionUrl: string;
  method: "POST";
  fields: {
    MerchantID: string;
    TradeInfo: string;
    TradeSha: string;
    Version: string;
  };
  merchantOrderNo: string;
  returnUrl: string;
};

export type NewebPayCheckoutPayloadInput = {
  config: Extract<NewebPayConfig, { ok: true }>;
  merchantOrderNo: string;
  amountMinor: number;
  itemDescription: string;
  returnUrl: string;
};

function encodePayload(payload: Record<string, string | number>) {
  return new URLSearchParams(
    Object.entries(payload).map(([key, value]) => [key, String(value)]),
  ).toString();
}

function addNewebPayPadding(payload: string) {
  const buffer = Buffer.from(payload, "utf8");
  const remainder = buffer.length % NEWEBPAY_AES_PADDING_BLOCK_SIZE;
  const paddingLength =
    remainder === 0
      ? NEWEBPAY_AES_PADDING_BLOCK_SIZE
      : NEWEBPAY_AES_PADDING_BLOCK_SIZE - remainder;

  return Buffer.concat([buffer, Buffer.alloc(paddingLength, paddingLength)]);
}

export function encryptNewebPayTradeInfo(
  payload: string,
  config: Extract<NewebPayConfig, { ok: true }>,
) {
  const cipher = crypto.createCipheriv("aes-256-cbc", config.hashKey, config.hashIv);
  cipher.setAutoPadding(false);
  const encrypted = Buffer.concat([cipher.update(addNewebPayPadding(payload)), cipher.final()]);

  return encrypted.toString("hex");
}

export function createNewebPayTradeSha(
  tradeInfo: string,
  config: Extract<NewebPayConfig, { ok: true }>,
) {
  return crypto
    .createHash("sha256")
    .update(`HashKey=${config.hashKey}&${tradeInfo}&HashIV=${config.hashIv}`)
    .digest("hex")
    .toUpperCase();
}

export function buildNewebPayCheckoutContract(
  input: NewebPayCheckoutPayloadInput,
): NewebPayCheckoutContract {
  const payload = encodePayload({
    MerchantID: input.config.merchantId,
    RespondType: "JSON",
    TimeStamp: Math.floor(Date.now() / 1000),
    Version: NEWEBPAY_MPG_VERSION,
    MerchantOrderNo: input.merchantOrderNo,
    Amt: input.amountMinor,
    ItemDesc: input.itemDescription,
    ReturnURL: input.returnUrl,
    NotifyURL: input.config.notifyUrl,
  });
  const tradeInfo = encryptNewebPayTradeInfo(payload, input.config);

  return {
    actionUrl: input.config.checkoutUrl,
    method: "POST",
    fields: {
      MerchantID: input.config.merchantId,
      TradeInfo: tradeInfo,
      TradeSha: createNewebPayTradeSha(tradeInfo, input.config),
      Version: NEWEBPAY_MPG_VERSION,
    },
    merchantOrderNo: input.merchantOrderNo,
    returnUrl: input.returnUrl,
  };
}
