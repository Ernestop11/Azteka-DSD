const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const { print } = require("pdf-to-printer");
const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");
const os = require("os");

const PORT = process.env.PORT || 4101;
const HOST = process.env.HOST || "127.0.0.1";
const app = express();

app.use(cors());
app.use(bodyParser.json({ limit: "2mb" }));

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

function formatCurrency(value) {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return "-";
  }
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
}

function buildLine(doc, parts) {
  const width = doc.page.width - doc.page.margins.left - doc.page.margins.right;
  const gap = 12;
  const colWidth = (width - gap) / parts.length;

  parts.forEach((text, index) => {
    doc.text(text, doc.x + index * (colWidth + gap), doc.y, {
      width: colWidth,
    });
  });

  doc.moveDown(0.6);
}

function generateReceipt(order) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 40 });
    const tempFile = path.join(
      os.tmpdir(),
      `order-${order?.id || Date.now()}.pdf`,
    );
    const writeStream = fs.createWriteStream(tempFile);

    writeStream.on("finish", () => resolve(tempFile));
    writeStream.on("error", reject);
    doc.on("error", reject);

    doc.pipe(writeStream);

    doc.fontSize(20).text("Azteka Order Receipt", { align: "center" });
    doc.moveDown();

    doc.fontSize(12);
    doc.text(`Order #: ${order?.orderNumber || order?.id || "N/A"}`);
    doc.text(`Customer: ${order?.customer?.name || order?.customerName || "N/A"}`);
    doc.text(`Date: ${order?.createdAt ? new Date(order.createdAt).toLocaleString() : new Date().toLocaleString()}`);
    doc.text(`Driver: ${order?.driver?.name || order?.driverName || "N/A"}`);
    doc.moveDown();

    doc.moveTo(doc.x, doc.y).lineTo(doc.page.width - doc.page.margins.right, doc.y).stroke();
    doc.moveDown(0.5);

    doc.font("Helvetica-Bold");
    buildLine(doc, ["Item", "Qty", "Price"]);
    doc.font("Helvetica");

    const items = Array.isArray(order?.items) ? order.items : [];
    if (items.length === 0) {
      doc.text("No line items provided.");
    } else {
      items.forEach((item) => {
        buildLine(doc, [
          item?.name || item?.sku || "Unknown",
          String(item?.quantity ?? item?.qty ?? "-"),
          formatCurrency(item?.total ?? item?.price ?? 0),
        ]);
      });
    }

    doc.moveDown();
    doc.font("Helvetica-Bold").text(`Subtotal: ${formatCurrency(order?.subtotal ?? order?.total ?? 0)}`);
    if (order?.tax) {
      doc.text(`Tax: ${formatCurrency(order.tax)}`);
    }
    doc.text(`Grand Total: ${formatCurrency(order?.grandTotal ?? order?.total ?? order?.subtotal ?? 0)}`);

    if (order?.notes) {
      doc.moveDown();
      doc.font("Helvetica").text(`Notes: ${order.notes}`);
    }

    doc.end();
  });
}

app.post("/print", async (req, res) => {
  const order = req.body;

  if (!order || typeof order !== "object") {
    return res.status(400).json({ error: "Order payload is required" });
  }

  try {
    const pdfPath = await generateReceipt(order);
    await print(pdfPath);

    fs.promises.unlink(pdfPath).catch((err) => {
      console.warn("Failed to remove temp PDF:", err);
    });

    return res.json({ ok: true, message: "Print job submitted" });
  } catch (error) {
    console.error("Print job failed:", error);
    return res.status(500).json({ error: "Failed to print order" });
  }
});

const server = app.listen(PORT, HOST, () => {
  console.log(`Print service running on http://${HOST}:${PORT}`);
});

const shutdown = () => {
  server.close(() => {
    process.exit(0);
  });
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
