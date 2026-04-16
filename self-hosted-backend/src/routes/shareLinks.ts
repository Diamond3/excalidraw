import { Router } from "express";
import { nanoid } from "nanoid";
import { query } from "../db";

const router = Router();

router.post("/post/", async (req, res) => {
  try {
    const id = nanoid(20);
    const chunks: Buffer[] = [];

    req.on("data", (chunk: Buffer) => chunks.push(chunk));
    req.on("end", async () => {
      try {
        const data = Buffer.concat(chunks);

        if (data.length > 5 * 1024 * 1024) {
          return res.status(413).json({
            error_class: "RequestTooLargeError",
            error: "Request too large",
          });
        }

        await query(
          "INSERT INTO share_links (id, data) VALUES ($1, $2)",
          [id, data],
        );

        res.json({ id });
      } catch (error) {
        console.error("Error saving share link:", error);
        res.status(500).json({ error: "Internal server error" });
      }
    });
  } catch (error) {
    console.error("Error in share link post:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await query(
      "SELECT data FROM share_links WHERE id = $1",
      [id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Share link not found" });
    }

    res.set("Content-Type", "application/octet-stream");
    res.send(result.rows[0].data);
  } catch (error) {
    console.error("Error loading share link:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
