const path = require("path");
const express = require("express");
const nodemailer = require("nodemailer");

const app = express();
const PORT = Number(process.env.PORT || 3000);
const ORDER_RECIPIENT = process.env.ORDER_RECIPIENT || "khanbs1251@gmail.com";

app.use(express.json());
app.use(express.static(path.join(__dirname)));

function createTransporter() {
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const host = process.env.SMTP_HOST || "smtp.gmail.com";
  const port = Number(process.env.SMTP_PORT || 465);

  if (!user || !pass) {
    throw new Error("SMTP_USER va SMTP_PASS o'rnatilmagan.");
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: {
      user,
      pass,
    },
  });
}

function buildOrderMail(order) {
  const rows = [
    `Yangi zakaz keldi`,
    ``,
    `Mahsulot: ${order.selectedPlan}`,
    `Soni: ${order.quantity}`,
    `Bir dona narxi: ${order.unitPrice.toLocaleString("uz-UZ")} UZS`,
    `Jami: ${order.total.toLocaleString("uz-UZ")} UZS`,
    `Gmail: ${order.gmail}`,
    `Aloqa: ${order.contact}`,
    `Izoh: ${order.notes || "-"}`,
    `Vaqt: ${new Date().toLocaleString("uz-UZ")}`,
  ];

  return rows.join("\n");
}

app.post("/api/orders", async (req, res) => {
  const { gmail, selectedPlan, contact, quantity, notes, unitPrice, total } = req.body || {};

  if (!gmail || !selectedPlan || !contact || !quantity || !unitPrice || !total) {
    return res.status(400).json({ message: "Majburiy maydonlar to'ldirilmagan." });
  }

  try {
    const transporter = createTransporter();
    await transporter.sendMail({
      from: process.env.ORDER_FROM || process.env.SMTP_USER,
      to: ORDER_RECIPIENT,
      subject: `Yangi Brawl Boost zakaz: ${selectedPlan}`,
      text: buildOrderMail({ gmail, selectedPlan, contact, quantity, notes, unitPrice, total }),
    });

    return res.json({ ok: true });
  } catch (error) {
    return res.status(500).json({
      message: `Email yuborishda xatolik: ${error.message}`,
    });
  }
});

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.listen(PORT, () => {
  console.log(`Server started on http://localhost:${PORT}`);
});
