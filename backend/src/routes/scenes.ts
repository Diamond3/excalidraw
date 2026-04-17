import { Router } from "express";
import { query } from "../db";

const router = Router();

router.get("/:roomId", async (req, res) => {
  try {
    const { roomId } = req.params;
    const result = await query(
      "SELECT scene_version, iv, ciphertext FROM scenes WHERE room_id = $1",
      [roomId],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Scene not found" });
    }

    const row = result.rows[0];
    res.json({
      sceneVersion: row.scene_version,
      iv: row.iv.toString("base64"),
      ciphertext: row.ciphertext.toString("base64"),
    });
  } catch (error) {
    console.error("Error loading scene:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/:roomId", async (req, res) => {
  try {
    const { roomId } = req.params;
    const { sceneVersion, iv, ciphertext } = req.body;

    const ivBuffer = Buffer.from(iv, "base64");
    const ciphertextBuffer = Buffer.from(ciphertext, "base64");

    await query(
      `INSERT INTO scenes (room_id, scene_version, iv, ciphertext, updated_at)
       VALUES ($1, $2, $3, $4, NOW())
       ON CONFLICT (room_id) DO UPDATE
       SET scene_version = $2, iv = $3, ciphertext = $4, updated_at = NOW()`,
      [roomId, sceneVersion, ivBuffer, ciphertextBuffer],
    );

    res.json({ success: true });
  } catch (error) {
    console.error("Error saving scene:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
