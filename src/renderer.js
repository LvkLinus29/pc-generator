const state = {
  options: null,
  result: null,
};

const form = document.querySelector("#generatorForm");
const useCases = document.querySelector("#useCases");
const goal = document.querySelector("#goal");
const budgetModeInputs = document.querySelectorAll("input[name='budgetMode']");
const singleBudget = document.querySelector("#singleBudget");
const rangeBudget = document.querySelector("#rangeBudget");
const resultPanel = document.querySelector("#resultPanel");
const errorMessage = document.querySelector("#errorMessage");
const copyButton = document.querySelector("#copyButton");
const resultTemplate = document.querySelector("#resultTemplate");

function selectedBudgetMode() {
  return document.querySelector("input[name='budgetMode']:checked").value;
}

function collectPayload() {
  const mode = selectedBudgetMode();
  const uses = [...document.querySelectorAll("input[name='use']:checked")].map((input) => input.value);

  if (mode === "range") {
    return {
      min: document.querySelector("#minBudget").value,
      max: document.querySelector("#maxBudget").value,
      uses,
      goal: goal.value,
    };
  }

  return {
    budget: document.querySelector("#budget").value,
    uses,
    goal: goal.value,
  };
}

function setBudgetMode() {
  const isRange = selectedBudgetMode() === "range";
  singleBudget.classList.toggle("is-hidden", isRange);
  rangeBudget.classList.toggle("is-hidden", !isRange);
}

function renderOptions() {
  useCases.innerHTML = "";
  state.options.useCases.forEach((item, index) => {
    const label = document.createElement("label");
    label.innerHTML = `
      <input type="checkbox" name="use" value="${item.id}" ${index === 0 ? "checked" : ""}>
      <span>${item.label}</span>
    `;
    useCases.append(label);
  });

  goal.innerHTML = "";
  state.options.goals.forEach((item) => {
    const option = document.createElement("option");
    option.value = item.id;
    option.textContent = item.label;
    if (item.id === "1440p") option.selected = true;
    goal.append(option);
  });
}

function renderResult(result) {
  const fragment = resultTemplate.content.cloneNode(true);

  fragment.querySelector(".result-use").textContent = `${result.input.useLabel} | ${result.input.goalLabel}`;
  fragment.querySelector(".result-title").textContent = result.build.title;
  fragment.querySelector(".result-subtitle").textContent = result.build.dubaroName;
  fragment.querySelector(".target-budget").textContent = result.totals.targetBudgetLabel;
  fragment.querySelector(".budget-label").textContent = result.input.budgetLabel;
  fragment.querySelector(".parts-total").textContent = result.totals.partsTotalLabel;
  fragment.querySelector(".budget-fit").textContent = result.totals.budgetFit;

  const dubaroLink = fragment.querySelector(".dubaro-link");
  dubaroLink.addEventListener("click", () => window.pcGenerator.openExternal(result.build.dubaroUrl));

  const partList = fragment.querySelector(".parts-list");
  result.parts.forEach((part) => {
    const card = document.createElement("article");
    card.className = "part-card";

    const type = document.createElement("div");
    type.className = "part-type";
    type.textContent = part.type;

    const details = document.createElement("div");
    details.className = "part-details";

    const name = document.createElement("a");
    name.className = "part-name";
    name.href = part.geizhalsUrl;
    name.textContent = part.name;
    name.title = "Direkt auf Geizhals oeffnen";
    name.addEventListener("click", (event) => {
      event.preventDefault();
      window.pcGenerator.openExternal(part.geizhalsUrl);
    });

    const url = document.createElement("button");
    url.className = "part-direct-link";
    url.type = "button";
    url.textContent = "Direktlink zu Geizhals";
    url.addEventListener("click", () => window.pcGenerator.openExternal(part.geizhalsUrl));

    details.append(name, url);

    const price = document.createElement("div");
    price.className = "part-price";
    price.textContent = part.estimateLabel;

    const openButton = document.createElement("button");
    openButton.className = "part-open";
    openButton.type = "button";
    openButton.textContent = "Oeffnen";
    openButton.addEventListener("click", () => window.pcGenerator.openExternal(part.geizhalsUrl));

    card.append(type, details, price, openButton);
    partList.append(card);
  });

  const notes = fragment.querySelector(".notes-list");
  result.build.notes.forEach((note) => {
    const item = document.createElement("li");
    item.textContent = note;
    notes.append(item);
  });

  resultPanel.innerHTML = "";
  resultPanel.append(fragment);
}

async function generate() {
  errorMessage.textContent = "";
  try {
    state.result = await window.pcGenerator.recommend(collectPayload());
    renderResult(state.result);
  } catch (error) {
    errorMessage.textContent = error.message;
  }
}

budgetModeInputs.forEach((input) => input.addEventListener("change", () => {
  setBudgetMode();
  generate();
}));

form.addEventListener("submit", (event) => {
  event.preventDefault();
  generate();
});

form.addEventListener("input", (event) => {
  if (event.target.matches("input, select")) {
    generate();
  }
});

copyButton.addEventListener("click", () => {
  if (!state.result) return;
  window.pcGenerator.copyText(state.result.text);
  copyButton.textContent = "Kopiert";
  setTimeout(() => {
    copyButton.textContent = "Ergebnis kopieren";
  }, 1200);
});

window.addEventListener("DOMContentLoaded", async () => {
  state.options = await window.pcGenerator.getOptions();
  renderOptions();
  setBudgetMode();
  generate();
});
