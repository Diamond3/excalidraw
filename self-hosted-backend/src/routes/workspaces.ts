import { Router } from "express";
import { nanoid } from "nanoid";
import { query } from "../db";

const router = Router();

// List all workspaces (name + id + dates only, no data)
router.get("/", async (_req, res) => {
  try {
    const result = await query(
      "SELECT id, name, created_at, updated_at FROM workspaces ORDER BY updated_at DESC",
    );
    res.json(result.rows);
  } catch (error) {
    console.error("Error listing workspaces:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get a single workspace
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await query(
      "SELECT id, name, data FROM workspaces WHERE id = $1",
      [id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Workspace not found" });
    }

    res.set("Content-Type", "application/octet-stream");
    res.send(result.rows[0].data);
  } catch (error) {
    console.error("Error loading workspace:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Create or update a workspace
router.post("/", async (req, res) => {
  try {
    const { id, name } = req.query;
    const workspaceId = (id as string) || nanoid(20);
    const workspaceName = (name as string) || "Untitled";

    const chunks: Buffer[] = [];
    req.on("data", (chunk: Buffer) => chunks.push(chunk));
    req.on("end", async () => {
      try {
        const data = Buffer.concat(chunks);

        await query(
          `INSERT INTO workspaces (id, name, data, updated_at)
           VALUES ($1, $2, $3, NOW())
           ON CONFLICT (id) DO UPDATE
           SET name = $2, data = $3, updated_at = NOW()`,
          [workspaceId, workspaceName, data],
        );

        res.json({ id: workspaceId, name: workspaceName });
      } catch (error) {
        console.error("Error saving workspace:", error);
        res.status(500).json({ error: "Internal server error" });
      }
    });
  } catch (error) {
    console.error("Error in workspace post:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Delete a workspace
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await query("DELETE FROM workspaces WHERE id = $1", [id]);
    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting workspace:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
