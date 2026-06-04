import { Queue } from "bullmq";
import connection from "./redis.js";   // ✅ UPDATED (removed IORedis)

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