import dotenv from "dotenv";
dotenv.config();

import { PORT } from "./config";

import App from "./app";
import { router } from "./router";

const app = new App(router);
app.init(() => console.log(`🚀 Server ready at: http://localhost:${PORT}`));
