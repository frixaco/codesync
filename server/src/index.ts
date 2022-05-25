import dotenv from "dotenv"
dotenv.config()

import express from "express";

const PORT = process.env.PORT || 3001;

const app = express();

app.use(express.json());

app.use("/auth", require("./routes/auth"));
app.use("/users", require("./routes/users"));
app.use("/devices", require("./routes/devices"));
app.use("/changes", require("./routes/changes"));

app.listen(PORT, () => {
  console.log(`🚀 Server ready at: http://localhost:${PORT}`);
});
