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
const ADMIN_SESSION_KEY = "brawl_boost_admin_session";
const ADMIN_PASSWORD = "brawlboost2026";

const adminLogin = document.getElementById("adminLogin");
const adminApp = document.getElementById("adminApp");
const adminLoginForm = document.getElementById("adminLoginForm");
const adminPassword = document.getElementById("adminPassword");
const adminError = document.getElementById("adminError");
const priceGrid = document.getElementById("priceGrid");
const priceForm = document.getElementById("priceForm");
const resetPricesButton = document.getElementById("resetPrices");
const ordersList = document.getElementById("ordersList");
const clearOrdersButton = document.getElementById("clearOrders");
const orderCount = document.getElementById("orderCount");
const toast = document.getElementById("toast");

function readPrices() {
  try {
    const saved = JSON.parse(localStorage.getItem(PRICES_KEY) || "{}");
    return { ...DEFAULT_PRICES, ...saved };
  } catch {
    return { ...DEFAULT_PRICES };
  }
}

function savePrices(prices) {
  localStorage.setItem(PRICES_KEY, JSON.stringify(prices));
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

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("visible");
  window.clearTimeout(showToast.timeoutId);
  showToast.timeoutId = window.setTimeout(() => {
    toast.classList.remove("visible");
  }, 2600);
}

function unlockAdmin() {
  sessionStorage.setItem(ADMIN_SESSION_KEY, "ok");
  document.body.classList.remove("admin-locked");
  adminLogin.hidden = true;
  adminApp.hidden = false;
  renderPrices();
  renderOrders();
}

function ensureAdminAccess() {
  if (sessionStorage.getItem(ADMIN_SESSION_KEY) === "ok") {
    unlockAdmin();
    return;
  }

  adminLogin.hidden = false;
  adminApp.hidden = true;
}

function renderPrices() {
  const prices = readPrices();
  priceGrid.innerHTML = "";

  Object.entries(prices).forEach(([plan, value]) => {
    const field = document.createElement("label");
    field.className = "admin-field";
    field.innerHTML = `
      <span>${plan}</span>
      <input type="number" min="0" step="1000" name="${plan}" value="${value}">
    `;
    priceGrid.appendChild(field);
  });
}

function renderOrders() {
  const orders = readOrders();
  ordersList.innerHTML = "";
  orderCount.textContent = `${orders.length} ta`;

  if (!orders.length) {
    ordersList.innerHTML = '<div class="empty-admin">Hozircha zakaz yo\'q.</div>';
    return;
  }

  orders.forEach((order) => {
    const item = document.createElement("article");
    item.className = "order-item";
    item.innerHTML = `
      <div class="order-top">
        <h3>${order.selectedPlan}</h3>
        <strong>${formatPrice(order.total)}</strong>
      </div>
      <div class="order-meta">
        <span>Gmail: ${order.gmail}</span>
        <span>Aloqa: ${order.contact}</span>
        <span>Soni: ${order.quantity}</span>
        <span>Bir dona: ${formatPrice(order.unitPrice)}</span>
        <span>Holat: ${order.status || "Yangi"}</span>
        <span>Vaqt: ${new Date(order.createdAt).toLocaleString("uz-UZ")}</span>
      </div>
      <p class="order-note">${order.notes || "Izoh qoldirilmagan."}</p>
    `;
    ordersList.appendChild(item);
  });
}

adminLoginForm.addEventListener("submit", (event) => {
  event.preventDefault();
  if (adminPassword.value === ADMIN_PASSWORD) {
    adminError.textContent = "";
    unlockAdmin();
    showToast("Admin panel ochildi.");
    return;
  }

  adminError.textContent = "Parol noto'g'ri.";
});

priceForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const formData = new FormData(priceForm);
  const nextPrices = {};

  Object.keys(DEFAULT_PRICES).forEach((plan) => {
    nextPrices[plan] = Number(formData.get(plan) || 0);
  });

  savePrices(nextPrices);
  renderPrices();
  showToast("Narxlar saqlandi.");
});

resetPricesButton.addEventListener("click", () => {
  savePrices(DEFAULT_PRICES);
  renderPrices();
  showToast("Standart narxlar qaytarildi.");
});

clearOrdersButton.addEventListener("click", () => {
  saveOrders([]);
  renderOrders();
  showToast("Zakazlar tozalandi.");
});

ensureAdminAccess();
