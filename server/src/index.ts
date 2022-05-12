import { PrismaClient } from "@prisma/client";
import express from "express";

const PORT = process.env.PORT || 3001;

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
  console.log("server: save data=", Object.keys(data.diff));
  res.json({ success: true });
});

app.get(`/`, async (req, res) => {
  console.log("server: get data=", Object.keys(data.diff));
  res.json(data);
});

const server = app.listen(PORT, () => {
  main()
    .catch((e) => {
      throw e;
    })
    .finally(async () => {
      await prisma.$disconnect();
    });

  console.log(`🚀 Server ready at: http://localhost:${PORT}`);
});
