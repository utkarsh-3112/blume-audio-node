import express from "express";
import bodyParser from "body-parser";
import Queue from "bull";
import audioToReport from "./tasks.js";
import cors from "cors";
import dotenv from 'dotenv';

dotenv.config();
const app = express();

app.use(cors());
app.use(bodyParser.json());

const audioQueue = new Queue("audio processing", {
  redis:{
  port: 16477,
  host: process.env.REDIS_HOST,
  username: "default",
  password: process.env.REDIS_PASSWORD}
    });

app.options("/api", cors(), (req, res) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.sendStatus(200);
});

app.get("/api", async (req, res) => {
  res.send("Hello");
});

audioQueue.process(async (job) => {
  try {
  const { download_url, email_address, file_extension, selectedOption } = job.data;
  await audioToReport(download_url, email_address, file_extension, selectedOption);}
  catch (error) {
    console.error(error);
  }
});

app.post("/api", async (req, res) => {
  const job = await audioQueue.add(req.body)

  res.json({jobId: job.id}) 
});

process.on('SIGTERM', () => {
  audioQueue.close()
})

const port = process.env.PORT || 4002;
app.listen(port);
