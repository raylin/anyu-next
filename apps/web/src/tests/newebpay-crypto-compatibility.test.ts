import { describe, expect, it } from "vitest";
import {
  createNewebPayTradeSha,
  encryptNewebPayTradeInfo,
} from "@/lib/payments/newebpay/checkout-payload";

const officialSampleConfig = {
  ok: true,
  merchantId: "3430112",
  hashKey: "12345678901234567890123456789012",
  hashIv: "1234567890123456",
  checkoutUrl: "https://ccore.newebpay.com/MPG/mpg_gateway",
  returnUrlBase: "https://example.test",
  notifyUrl: "https://example.test/api/payments/newebpay/notify",
  providerEnvironment: "sandbox",
} as const;

describe("NewebPay crypto compatibility", () => {
  it("matches the public MPG AES sample vector", () => {
    const samplePayload =
      "MerchantID=3430112&RespondType=JSON&TimeStamp=1485232229&Version=1.4&MerchantOrderNo=S_1485232229&Amt=40&ItemDesc=UnitTest";
    const officialTradeInfo =
      "ff91c8aa01379e4de621a44e5f11f72e4d25bdb1a18242db6cef9ef07d80b0165e476fd1d9acaa53170272c82d122961e1a0700a7427cfa1cf90db7f6d6593bbc93102a4d4b9b66d9974c13c31a7ab4bba1d4e0790f0cbbbd7ad64c6d3c8012a601ceaa808bff70f94a8efa5a4f984b9d41304ffd879612177c622f75f4214fa";

    const tradeInfo = encryptNewebPayTradeInfo(samplePayload, officialSampleConfig);

    expect(tradeInfo).toBe(officialTradeInfo);
    expect(createNewebPayTradeSha(tradeInfo, officialSampleConfig)).toBe(
      "EA0A6CC37F40C1EA5692E7CBB8AE097653DF3E91365E6A9CD7E91312413C7BB8",
    );
  });
});
