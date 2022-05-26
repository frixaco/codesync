import dotenv from "dotenv";
dotenv.config();

import express from "express";

import authController from "./routes/auth";
import usersController from "./routes/users";
import devicesController from "./routes/devices";
import changesController from "./routes/changes";

const PORT = process.env.PORT || 3001;

const app = express();

app.use(express.json());

app.use("/auth", authController);
app.use("/users", usersController);
app.use("/devices", devicesController);
app.use("/changes", changesController);

app.listen(PORT, () => {
    console.log(`🚀 Server ready at: http://localhost:${PORT}`);
});
