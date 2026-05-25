# Analyze Timeout Diagnosis + Hotfix v0 Review Bundle

Date: 2026-05-25

## Review Summary

Analyze CTA failures were caused by the current synchronous analyze path taking longer than the 65s browser timeout, plus a brittle semantic-validation gate that could reject otherwise valid paidResult v2 output after a long provider call.

The hotfix keeps paidResult v2 and schema v2 intact while making the output more concise and the timeout boundaries explicit.

## What Changed

- Analyze route now declares a 90s max duration.
- Client analyze request timeout is now 95s.
- Paid-result prompt now targets 1,200-1,800 Traditional Chinese characters instead of 1,800-2,800.
- Paid-result prompt asks for exactly 6 copyable messages instead of 6-9.
- Semantic validation no longer hard-fails on broad style terms that are common in safe relationship advice.
- Semantic validation still blocks clearly unsafe, shaming, or manipulative phrasing.

## PaidResult v2 Shape

Preserved:

- 3 possible states
- 3 signal deep dives
- 3 reply strategies
- 6 copyable messages
- 48-hour plan
- Summary card

## Verification

- Local provider path validated with the v2 shape in about 62s.
- Staging fresh analyze completed in about 63s.
- Staging repeat analyze returned cache hit in about 2s.
- Production fresh analyze completed in about 68s.
- Production repeat analyze returned cache hit in about 3s.

## Safety Notes

- No LINE webhook or LIFF changes.
- No payment, email, ads, or legal text changes.
- No raw request text, provider raw output, secrets, tokenized URLs, or private user data included in this bundle.

## Remaining Risk

Analyze is restored but still slow for a synchronous route. The immediate product risk is reduced, but the architecture still needs either a more reliable async/polling flow or a faster model/prompt strategy if paidResult v2 depth remains high.

## Recommended Review Focus

- Confirm whether the more concise paid result still feels valuable enough for the paid/unlocked experience.
- Decide whether semantic validation should become a severity-scored warning system instead of one hard-fail list.
- Consider a follow-up async analyze request-state flow to remove browser timeout sensitivity.
