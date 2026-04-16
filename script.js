const DEFAULT_PRICES = {
  "30 Gem": 16000,
  "80 Gem": 35000,
  "170 Gem": 70000,
  "360 Gem": 110000,
  "950 Gem": 300000,
  "2000 Gem": 500000,
  "Brawl Pass": 90000,
  "Brawl Pass Plus": 150000,
  "Pro Pass": 300000,
};

const PRICES_KEY = "brawl_boost_prices";
const ORDERS_KEY = "brawl_boost_orders";

const selectedPlanInput = document.getElementById("selectedPlan");
const quantityInput = document.getElementById("quantity");
const summaryPlan = document.getElementById("summaryPlan");
const summaryBase = document.getElementById("summaryBase");
const summaryQty = document.getElementById("summaryQty");
const summaryTotal = document.getElementById("summaryTotal");
const summaryStatus = document.getElementById("summaryStatus");
const toast = document.getElementById("toast");
const orderForm = document.getElementById("orderForm");
const productCards = document.querySelectorAll("[data-plan]");
const selectButtons = document.querySelectorAll(".select-button");
const submitOrderButton = document.getElementById("submitOrder");

function readPrices() {
  try {
    const saved = JSON.parse(localStorage.getItem(PRICES_KEY) || "{}");
    return { ...DEFAULT_PRICES, ...saved };
  } catch {
    return { ...DEFAULT_PRICES };
  }
}

function readOrders() {
  try {
    return JSON.parse(localStorage.getItem(ORDERS_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveOrders(orders) {
  localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
}

function formatPrice(value) {
  return `${Number(value || 0).toLocaleString("uz-UZ")} UZS`;
}

function getCurrentPrice() {
  const prices = readPrices();
  return prices[selectedPlanInput.value] ?? 0;
}

function syncCardPrices() {
  const prices = readPrices();
  productCards.forEach((card) => {
    const plan = card.dataset.plan;
    const priceNode = card.querySelector(".pack-price");
    if (plan && priceNode && prices[plan] != null) {
      priceNode.textContent = formatPrice(prices[plan]);
    }
  });
}

function syncSummary() {
  const quantity = Math.max(1, Number(quantityInput.value) || 1);
  const price = getCurrentPrice();
  const total = price * quantity;

  summaryPlan.textContent = selectedPlanInput.value;
  summaryBase.textContent = formatPrice(price);
  summaryQty.textContent = String(quantity);
  summaryTotal.textContent = formatPrice(total);
  quantityInput.value = String(quantity);

  productCards.forEach((card) => {
    card.classList.toggle("active", card.dataset.plan === selectedPlanInput.value);
  });
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("visible");
  window.clearTimeout(showToast.timeoutId);
  showToast.timeoutId = window.setTimeout(() => {
    toast.classList.remove("visible");
  }, 2600);
}

selectButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const card = button.closest("[data-plan]");
    if (!card) return;

    selectedPlanInput.value = card.dataset.plan ?? "360 Gem";
    syncSummary();
    document.getElementById("checkout").scrollIntoView({ behavior: "smooth", block: "start" });
  });
});

selectedPlanInput.addEventListener("input", syncSummary);
quantityInput.addEventListener("input", syncSummary);

orderForm.addEventListener("submit", (event) => {
  event.preventDefault();
  syncSummary();

  const formData = new FormData(orderForm);
  const quantity = Math.max(1, Number(quantityInput.value) || 1);
  const unitPrice = getCurrentPrice();
  const order = {
    id: Date.now(),
    createdAt: new Date().toISOString(),
    gmail: String(formData.get("gmail") ?? "").trim(),
    selectedPlan: selectedPlanInput.value,
    contact: String(formData.get("contact") ?? "").trim(),
    quantity,
    notes: String(formData.get("notes") ?? "").trim(),
    unitPrice,
    total: unitPrice * quantity,
    status: "Yangi",
  };

  submitOrderButton.disabled = true;
  summaryStatus.textContent = "Yuborilmoqda...";

  const orders = readOrders();
  orders.unshift(order);
  saveOrders(orders);

  summaryStatus.textContent = "Admin panelga tushdi";
  showToast("So'rov saqlandi. Admin panelda ko'rinadi.");
  orderForm.reset();
  selectedPlanInput.value = "360 Gem";
  quantityInput.value = "1";
  syncSummary();
  submitOrderButton.disabled = false;
});

syncCardPrices();
syncSummary();
