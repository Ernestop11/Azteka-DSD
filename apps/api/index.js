import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import pkg from "@prisma/client";

dotenv.config();
const { PrismaClient } = pkg;
const prisma = new PrismaClient();
const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => res.json({ ok: true }));

app.get("/api/products", async (req, res) => {
  const products = await prisma.product.findMany();
  res.json(products);
});

app.listen(4102, () => console.log("✅ API running on port 4102"));
