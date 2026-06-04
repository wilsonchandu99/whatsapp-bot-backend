import db from "./db.js";

/* ================= DEBUG CHECK ================= */
if (!db || typeof db.query !== "function") {
  throw new Error("❌ DB not initialized. Check db.js");
}

/* =========================================================
   🔄 CREATE OR GET ACTIVE TICKET
========================================================= */
export async function getOrCreateTicket(phone) {
  try {
    if (!phone) throw new Error("Phone is required");

    const existing = await db.query(
      `SELECT * FROM tickets 
       WHERE phone = $1 
       AND status IN ('OPEN','PROCESSING')
       ORDER BY id DESC 
       LIMIT 1`,
      [phone]
    );

    if (existing.rows.length > 0) {
      return existing.rows[0];
    }

    const result = await db.query(
      `INSERT INTO tickets (phone, status, state, created_at)
       VALUES ($1, 'OPEN', 'INIT', NOW())
       RETURNING *`,
      [phone]
    );

    return result.rows[0];
  } catch (err) {
    console.error("❌ getOrCreateTicket ERROR:", err.message);
    return null;
  }
}

/* =========================================================
   🧠 SMART TEXT PROCESSING (NEW 🔥)
========================================================= */
export async function processMessage(ticketId, text) {
  try {
    if (!text) return;

    console.log("📩 Incoming:", text);

    // 🔥 Extract UPI
    let upi = null;
    if (text.includes("@")) {
      upi = text.trim();
      console.log("💳 UPI Detected:", upi);
    }

    // 🔥 Extract Issue (basic for now)
    let issue = text;

    await db.query(
      `
      UPDATE tickets
      SET 
        issue = COALESCE(issue, $1),
        upi = COALESCE(upi, $2),
        updated_at = NOW()
      WHERE id = $3
      `,
      [issue, upi, ticketId]
    );

    return true;
  } catch (err) {
    console.error("processMessage error:", err.message);
    return false;
  }
}

/* =========================================================
   📝 ISSUE
========================================================= */
export async function updateIssue(ticketId, issue) {
  try {
    await db.query(
      "UPDATE tickets SET issue = $1, updated_at = NOW() WHERE id = $2",
      [issue, ticketId]
    );
    return true;
  } catch (err) {
    console.error("updateIssue error:", err.message);
    return false;
  }
}

/* =========================================================
   💳 UPI (FIXED ✅)
========================================================= */
export async function updateUPI(ticketId, upi) {
  try {
    await db.query(
      "UPDATE tickets SET upi = $1, updated_at = NOW() WHERE id = $2",
      [upi, ticketId]
    );
    return true;
  } catch (err) {
    console.error("updateUPI error:", err.message);
    return false;
  }
}

/* =========================================================
   🏷️ ISSUE TYPE
========================================================= */
export async function updateIssueType(ticketId, type) {
  try {
    await db.query(
      "UPDATE tickets SET issue_type = $1 WHERE id = $2",
      [type, ticketId]
    );
    return true;
  } catch (err) {
    console.error("updateIssueType error:", err.message);
    return false;
  }
}

/* =========================================================
   📊 STATUS
========================================================= */
export async function updateStatus(ticketId, status) {
  try {
    await db.query(
      "UPDATE tickets SET status = $1 WHERE id = $2",
      [status, ticketId]
    );
    return true;
  } catch (err) {
    console.error("updateStatus error:", err.message);
    return false;
  }
}

/* =========================================================
   🔁 STATE
========================================================= */
export async function updateState(ticketId, state) {
  try {
    await db.query(
      "UPDATE tickets SET state = $1 WHERE id = $2",
      [state, ticketId]
    );
    return true;
  } catch (err) {
    console.error("updateState error:", err.message);
    return false;
  }
}

/* =========================================================
   🖼️ IMAGE (FIXED ✅)
========================================================= */
export async function updateImage(ticketId, imageUrl) {
  try {
    await db.query(
      "UPDATE tickets SET image = $1, updated_at = NOW() WHERE id = $2",
      [imageUrl, ticketId]
    );
    return true;
  } catch (err) {
    console.error("updateImage error:", err.message);
    return false;
  }
}

/* =========================================================
   ❌ CLOSE TICKET
========================================================= */
export async function closeTicket(ticketId) {
  try {
    await db.query(
      "UPDATE tickets SET status='CLOSED', state='CLOSED', updated_at=NOW() WHERE id=$1",
      [ticketId]
    );
    return true;
  } catch (err) {
    console.error("closeTicket error:", err.message);
    return false;
  }
}