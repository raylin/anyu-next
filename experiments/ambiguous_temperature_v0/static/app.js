const appConfig = window.__APP_CONFIG__ || {};

const analysisForm = document.getElementById("analysis-form");
const analyzeButton = document.getElementById("analyze-button");
const resetAnalysisButton = document.getElementById("reset-analysis-button");
const situationTypeSelect = document.getElementById("situation-type");
const situationChips = Array.from(document.querySelectorAll(".situation-chip"));
const inputText = document.getElementById("input-text");
const formError = document.getElementById("form-error");
const formStatus = document.getElementById("form-status");
const resultPanel = document.getElementById("result-panel");
const contactForm = document.getElementById("contact-form");
const contactTypeSelect = document.getElementById("contact-type");
const contactValueLabel = document.getElementById("contact-value-label");
const contactValueInput = document.getElementById("contact-value");
const contactError = document.getElementById("contact-error");
const contactStatus = document.getElementById("contact-status");
const paidUnlockButton = document.getElementById("paid-unlock-button");
const paidUnlockProxyButton = document.querySelector('[data-action="paid-unlock-proxy"]');
const shareCardButton = document.getElementById("share-card-button");
const shareCardPreview = document.getElementById("share-card-preview");
const temperatureFill = document.getElementById("temperature-fill");
const temperatureScore = document.getElementById("temperature-score");

const sessionStorageKey = "ambiguous-temperature-v0-session-id";
let inputStartedLogged = false;
let currentResult = null;
let currentSummary = null;

function getSessionId() {
  const existing = window.localStorage.getItem(sessionStorageKey);
  if (existing) {
    return existing;
  }
  const created = window.crypto.randomUUID();
  window.localStorage.setItem(sessionStorageKey, created);
  return created;
}

async function postJson(url, payload) {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Request failed.");
  }
  return data;
}

async function logEvent(eventName, properties = {}) {
  try {
    await postJson("/api/events", {
      event_name: eventName,
      session_id: getSessionId(),
      variant: appConfig.variant || "B",
      properties,
    });
  } catch (error) {
    console.warn("Event logging failed", error);
  }
}

function setMessage(element, message, isError = false) {
  element.hidden = !message;
  element.textContent = message || "";
  if (isError) {
    element.classList.add("error");
  } else {
    element.classList.remove("error");
  }
}

function syncSituationChips() {
  for (const chip of situationChips) {
    const isActive = chip.dataset.value === situationTypeSelect.value;
    chip.classList.toggle("is-active", isActive);
    chip.setAttribute("aria-pressed", isActive ? "true" : "false");
  }
}

function updateAnalyzeButtonState() {
  const hasInput = inputText.value.trim().length > 0;
  analyzeButton.disabled = !hasInput;
  analyzeButton.textContent = hasInput ? "分析我的曖昧溫度" : "先貼一段對話";
}

function setSituationType(value, shouldLog = true) {
  situationTypeSelect.value = value;
  syncSituationChips();
  if (shouldLog) {
    logEvent("situation_selected", {
      situation_type: situationTypeSelect.value,
    });
  }
}

function updateTemperatureVisual(score) {
  const safeScore = Math.max(0, Math.min(100, Number(score) || 0));
  temperatureFill.style.width = `${safeScore}%`;
  temperatureScore.setAttribute("aria-label", `當前溫度 ${safeScore} 滿分 100`);
}

function renderResult(result) {
  const freeResult = result.free_result;
  const insightLayer = result.insight_layer;
  const shareCard = result.share_card;
  const paidPreview = result.paid_preview;

  document.getElementById("temperature-score").textContent = String(freeResult.temperature_score);
  updateTemperatureVisual(freeResult.temperature_score);
  document.getElementById("state-label").textContent = freeResult.state_label;
  document.getElementById("one-sentence-read").textContent = freeResult.one_sentence_read;
  document.getElementById("uncertainty-note").textContent = freeResult.uncertainty_note;
  document.getElementById("paid-teaser").textContent = freeResult.paid_teaser;

  const observedSignals = document.getElementById("observed-signals");
  observedSignals.innerHTML = "";
  for (const signal of freeResult.observed_signals) {
    const item = document.createElement("li");
    item.textContent = signal;
    observedSignals.appendChild(item);
  }

  document.getElementById("insight-title").textContent = insightLayer.title;
  document.getElementById("insight-explanation").textContent = insightLayer.explanation;

  document.getElementById("share-temperature-label").textContent = shareCard.temperature_label;
  document.getElementById("share-state-label").textContent = shareCard.state_label;
  document.getElementById("share-persona").textContent = shareCard.relationship_persona;
  document.getElementById("share-sentence").textContent = shareCard.card_sentence;

  document.getElementById("paid-headline").textContent = paidPreview.headline;
  document.getElementById("paid-price").textContent = paidPreview.price;

  const includedSections = document.getElementById("paid-included-sections");
  includedSections.innerHTML = "";
  for (const section of paidPreview.included_sections) {
    const item = document.createElement("li");
    item.textContent = section;
    includedSections.appendChild(item);
  }

  document.getElementById("paid-preview-copy").textContent = paidPreview.preview_copy;
  resultPanel.hidden = false;
}

function updateContactLabel() {
  contactValueLabel.textContent = contactTypeSelect.value === "email" ? "Email" : "LINE ID";
}

function resetForNewAnalysis() {
  contactForm.hidden = true;
  setMessage(contactError, "");
  setMessage(contactStatus, "");
  setMessage(formError, "");
  setMessage(formStatus, "");
  inputText.focus();
}

async function handleShareCardClick() {
  if (!currentResult) {
    return;
  }
  await logEvent("share_card_clicked", {
    state_label: currentResult.free_result.state_label,
    temperature_score: currentResult.free_result.temperature_score,
  });
  setMessage(formStatus, "已記錄分享卡點擊。");
}

async function handlePaidUnlockClick() {
  if (!currentResult) {
    setMessage(formError, "請先完成分析。", true);
    return;
  }
  await logEvent("paid_unlock_clicked", {
    situation_type: currentSummary?.situation_type || situationTypeSelect.value,
    state_label: currentSummary?.state_label || currentResult.free_result.state_label,
    temperature_score: currentSummary?.temperature_score || currentResult.free_result.temperature_score,
    price: currentSummary?.price || currentResult.paid_preview.price,
  });
  contactForm.hidden = false;
  contactForm.scrollIntoView({ behavior: "smooth", block: "start" });
}

window.addEventListener("load", () => {
  logEvent("page_view", {
    entry_point: "prototype",
    variant: appConfig.variant || "B",
  });
  syncSituationChips();
  updateAnalyzeButtonState();
  updateContactLabel();
});

for (const chip of situationChips) {
  chip.addEventListener("click", () => {
    setSituationType(chip.dataset.value || "不確定 / 跳過");
  });
}

situationTypeSelect.addEventListener("change", syncSituationChips);

inputText.addEventListener("input", () => {
  updateAnalyzeButtonState();
  if (!inputStartedLogged && inputText.value.trim()) {
    inputStartedLogged = true;
    logEvent("input_started", {
      situation_type: situationTypeSelect.value,
    });
  }
});

analysisForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  setMessage(formError, "");
  setMessage(formStatus, "分析中...");
  contactForm.hidden = true;
  setMessage(contactError, "");
  setMessage(contactStatus, "");

  try {
    const data = await postJson("/api/analyze", {
      session_id: getSessionId(),
      variant: appConfig.variant || "B",
      situation_type: situationTypeSelect.value,
      input_text: inputText.value,
    });
    currentResult = data.result;
    currentSummary = data.summary;
    renderResult(data.result);
    setMessage(formStatus, "分析完成。");
  } catch (error) {
    setMessage(formError, error.message, true);
    setMessage(formStatus, "");
  }
});

shareCardButton.addEventListener("click", handleShareCardClick);
shareCardPreview.addEventListener("click", handleShareCardClick);
paidUnlockButton.addEventListener("click", handlePaidUnlockClick);
paidUnlockProxyButton.addEventListener("click", handlePaidUnlockClick);

resetAnalysisButton.addEventListener("click", () => {
  resetForNewAnalysis();
  window.scrollTo({ top: 0, behavior: "smooth" });
});

contactTypeSelect.addEventListener("change", updateContactLabel);

contactForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!currentResult) {
    setMessage(contactError, "請先完成分析。", true);
    return;
  }
  setMessage(contactError, "");
  setMessage(contactStatus, "送出中...");

  try {
    const data = await postJson("/api/contact", {
      session_id: getSessionId(),
      variant: appConfig.variant || "B",
      contact_type: contactTypeSelect.value,
      contact_value: contactValueInput.value,
      situation_type: currentSummary?.situation_type || situationTypeSelect.value,
      state_label: currentSummary?.state_label || currentResult.free_result.state_label,
      temperature_score: currentSummary?.temperature_score || currentResult.free_result.temperature_score,
    });
    setMessage(contactStatus, data.message);
    contactForm.reset();
    updateContactLabel();
  } catch (error) {
    setMessage(contactError, error.message, true);
    setMessage(contactStatus, "");
  }
});
