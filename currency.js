const API_URL =
  "https://api.currencyapi.com/v3/latest?apikey=cur_live_sxoPAB9b4KNM9fMPno9hlJstR6I3gWo7Hmmf5mG2";
let rates = {};
let baseCurrency = "USD";

document.querySelectorAll(".tab-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    document
      .querySelectorAll(".tab-btn")
      .forEach((b) => b.classList.remove("active"));
    document
      .querySelectorAll(".section")
      .forEach((s) => s.classList.remove("active"));
    btn.classList.add("active");
    document.getElementById(btn.dataset.tab).classList.add("active");
  });
});

function toggleSetting(el) {
  el.classList.toggle("active");
}

function swapCurrencies() {
  const from = document.getElementById("fromCurrency");
  const to = document.getElementById("toCurrency");
  [from.value, to.value] = [to.value, from.value];
  convertCurrency();
}

async function fetchRates() {
  try {
    const res = await fetch(API_URL);
    const data = await res.json();
    rates = data.data || {};
    baseCurrency = Object.keys(rates)[0] || "USD";
    document.getElementById("lastUpdated").textContent =
      "Last updated: " + (data.meta?.last_updated_at || "N/A");
    updateMarket();
    updateQuickRates();
    convertCurrency();
  } catch (error) {
    document.getElementById("result").textContent = "API Error";
    document.getElementById("rateInfo").textContent =
      "Unable to load live rates";
  }
}

function getRate(currency) {
  if (currency === baseCurrency) return 1;
  return rates[currency]?.value || null;
}

function convertCurrency() {
  const amount = parseFloat(document.getElementById("amount").value || 0);
  const from = document.getElementById("fromCurrency").value;
  const to = document.getElementById("toCurrency").value;

  if (!rates[from] || !rates[to]) {
    document.getElementById("result").textContent = "N/A";
    document.getElementById("rateInfo").textContent = "Rate not available";
    return;
  }

  const fromRate = getRate(from);
  const toRate = getRate(to);
  const converted = (amount / fromRate) * toRate;

  document.getElementById("result").textContent =
    `${converted.toFixed(4)} ${to}`;
  document.getElementById("rateInfo").textContent =
    `1 ${from} = ${(toRate / fromRate).toFixed(4)} ${to}`;
}

function updateMarket() {
  const pairs = [
    ["USD", "INR"],
    ["EUR", "INR"],
    ["GBP", "INR"],
    ["JPY", "INR"],
  ];

  const html = pairs
    .map(([from, to]) => {
      if (!rates[from] || !rates[to])
        return `<div class="list-item"><span>${from} → ${to}</span><span>--</span></div>`;
      const value = getRate(to) / getRate(from);
      return `<div class="list-item"><span>${from} → ${to}</span><span>${value.toFixed(4)}</span></div>`;
    })
    .join("");

  document.getElementById("marketList").innerHTML = html;
}

function updateQuickRates() {
  const items = ["USD", "EUR", "GBP", "INR"];
  const html = items
    .map((cur) => {
      const value = rates[cur]?.value;
      return `<div class="list-item"><span>${cur}</span><span>${value ? value.toFixed(4) : "--"}</span></div>`;
    })
    .join("");
  document.getElementById("quickRates").innerHTML = html;
}

async function loadHistory() {
  const date = document.getElementById("historyDate").value;
  if (!date) {
    document.getElementById("historyResult").textContent = "--";
    document.getElementById("historyInfo").textContent = "Please select a date";
    return;
  }
  document.getElementById("historyResult").textContent = "Loading...";
  document.getElementById("historyInfo").textContent =
    `Requested date: ${date}`;
  document.getElementById("historyInfo").textContent +=
    " (connect historical endpoint here)";
}

fetchRates();
setInterval(fetchRates, 300000);