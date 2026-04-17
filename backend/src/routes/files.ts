import { Router } from "express";
import { query } from "../db";

const router = Router();

router.post("/", async (req, res) => {
  try {
    const { prefix, fileId, data } = req.body;
    const dataBuffer = Buffer.from(data, "base64");

    await query(
      `INSERT INTO files (prefix, file_id, data)
       VALUES ($1, $2, $3)
       ON CONFLICT (prefix, file_id) DO UPDATE
       SET data = $3`,
      [prefix, fileId, dataBuffer],
    );

    res.json({ success: true });
  } catch (error) {
    console.error("Error saving file:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/:prefix/:fileId", async (req, res) => {
  try {
    const { prefix, fileId } = req.params;
    const result = await query(
      "SELECT data FROM files WHERE prefix = $1 AND file_id = $2",
      [prefix, fileId],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "File not found" });
    }

    res.set("Content-Type", "application/octet-stream");
    res.set(
      "Cache-Control",
      "public, max-age=31536000",
    );
    res.send(result.rows[0].data);
  } catch (error) {
    console.error("Error loading file:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
