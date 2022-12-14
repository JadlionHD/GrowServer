import express from "express";
import { readFileSync } from "node:fs";
import http from "node:http";
import https from "node:https";
import { Logger } from "./Logger";
import bodyparser from "body-parser";
import rateLimit from "express-rate-limit";
import path from "node:path";
import { Database } from "../database/db";
const app = express();

const options = {
  key: readFileSync("./assets/ssl/server.key"),
  cert: readFileSync("./assets/ssl/server.crt")
};

const apiLimiter = rateLimit({
  windowMs: 10800000, // 3 hour
  max: 5, // Limit each IP to 5 requests per `window`
  message: "Too many accounts created from this IP, please try again after 3 hour",
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false // Disable the `X-RateLimit-*` headers
});

export function WebServer(log: Logger, db: Database) {
  app.use(bodyparser.urlencoded({ extended: true }));
  app.use(bodyparser.json());
  app.set("view engine", "ejs");

  app.set("views", path.join(__dirname, "../../web/views"));

  app.use("/growtopia/server_data.php", (req, res) => {
    res.send(
      "server|127.0.0.1\nport|17091\ntype|1\n#maint|Maintenance woi\nmeta|lolwhat\nRTENDMARKERBS1001"
    );
  });

  app.get("/register", (req, res) => {
    res.render("register.ejs");
  });

  app.post("/api/register", apiLimiter, async (req, res) => {
    if (req.body && req.body.username && req.body.password) {
      let result = await db.createUser(req.body.username, req.body.password);

      if (result) res.send("OK, Successfully creating account");
      else res.send("Error");
    }
  });

  let httpServer = http.createServer(app);
  let httpsServer = https.createServer(options, app);

  httpServer.listen(80);
  httpsServer.listen(443);

  httpsServer.on("listening", function () {
    log.ready(`Starting web server on: http://${process.env.WEB_ADDRESS}:80`);
    log.info(
      `To register account you need to register at: http://${process.env.WEB_ADDRESS}:80/register`
    );
  });
}
