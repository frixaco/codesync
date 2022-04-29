import { PrismaClient } from "@prisma/client";
import express from "express";

const app = express();

app.use(express.json());

let data: any = null;

const prisma = new PrismaClient();

async function main() {
  const allUsers = await prisma.user.findMany();
  console.log("users", allUsers);
}

app.post(`/`, async (req, res) => {
  data = req.body;
  res.json({ msg: "SUCCESS" });
});

app.get(`/`, async (req, res) => {
  res.json(data);
});

const server = app.listen(3000, () => {
  main()
    .catch((e) => {
      throw e;
    })
    .finally(async () => {
      await prisma.$disconnect();
    });

  console.log(`🚀 Server ready at: http://localhost:3000`);
});
