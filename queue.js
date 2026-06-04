import { Queue } from "bullmq";
import IORedis from "ioredis";

const connection = new IORedis({
  host: process.env.REDIS_HOST || "127.0.0.1",
  port: Number(process.env.REDIS_PORT || 6379),
  maxRetriesPerRequest: null,
});

connection.on("connect", () => {
  console.log("✅ BullMQ Redis connected");
});

connection.on("error", (err) => {
  console.log("❌ BullMQ Redis error:", err.message);
});

const ticketQueue = new Queue("ticketQueue", {
  connection,
});

export default ticketQueue;