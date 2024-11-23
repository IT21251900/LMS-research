import express from "express";
import config from "config";
import { initDatabase } from "./data-access";
import { log } from "./util/logger";
import bodyParser from "body-parser";
import cors from "cors";
import fileUpload from "express-fileupload";
import { routes } from "./routes";

const app = express();
const port = process.env.PORT || config.get("server.port") || 3000;

// Database initiation
initDatabase();

// Server configuration
app.use(bodyParser.urlencoded({ limit: "1mb", extended: true }));
app.use(bodyParser.json({ limit: "1mb" }));
app.use(cors());
app.use(fileUpload());

// Routes initialization
routes(app);

app.listen(port, () => {
    log.info(`LMS-USER API Server v${process.env.npm_package_version} started on PORT ${port}`);
});
