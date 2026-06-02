import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";

const FLAT_FILE = path.join(process.cwd(), "submissions.txt");

// Seed initial values if file does not exist or is empty
try {
  if (!fs.existsSync(FLAT_FILE) || fs.readFileSync(FLAT_FILE, "utf-8").trim() === "") {
    const initialSeeds = [
      "2026-06-02 08:30:15|Robert Fox|robert@fox.io|System update and audit logs requested for the secondary node.",
      "2026-06-02 09:12:44|Jenny Wilson|jenny.w@corp.com|Flat file structure parsed and index configurations updated.",
      "2026-06-02 10:04:18|Guy Hawkins|guy.h@web.net|New connection interface successfully established.",
      "2026-06-02 11:15:02|Esther Howard|esther@startup.co|Daily automatic file system backup is operating cleanly."
    ].join("\n") + "\n";
    fs.writeFileSync(FLAT_FILE, initialSeeds, "utf-8");
  }
} catch (seedErr) {
  console.error("Failed to write seed data:", seedErr);
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware to parse body content
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // API Route: GET all submissions
  app.get("/api/submissions", (req, res) => {
    try {
      if (!fs.existsSync(FLAT_FILE)) {
        return res.json([]);
      }

      const fileContent = fs.readFileSync(FLAT_FILE, "utf-8");
      const lines = fileContent.split(/\r?\n/);
      const parsedSubmissions = [];

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;

        const parts = trimmed.split("|");
        // Ensure we have at least 4 parts: timestamp, name, email, comments
        if (parts.length >= 4) {
          const [timestamp, name, email, ...commentsArr] = parts;
          parsedSubmissions.push({
            timestamp,
            name,
            email,
            comments: commentsArr.join("|"), // Merge any pipe characters back inside comments
          });
        }
      }

      // Return reverse-chronological submissions (newest first)
      res.json(parsedSubmissions.reverse());
    } catch (err) {
      console.error("Error reading submissions.txt:", err);
      res.status(500).json({ error: "Could not read submissions file." });
    }
  });

  // API Route: POST a new submission
  app.post("/api/submissions", (req, res) => {
    try {
      const { name, email, comments } = req.body;

      if (!name || !name.trim() || !email || !email.trim()) {
        return res.status(400).json({ error: "Name and Email are required fields." });
      }

      // Format Comments: replace newlines with a single space to preserve line counts
      const cleanComments = (comments || "").replace(/[\r\n]+/g, " ");
      
      // Generate current timestamp in human readable form 'YYYY-MM-DD HH:mm:ss'
      const now = new Date();
      const pad = (n: number) => n.toString().padStart(2, "0");
      const timestamp = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;

      // Line format: timestamp|name|email|comments
      const line = `${timestamp}|${name.trim()}|${email.trim()}|${cleanComments}\n`;

      fs.appendFileSync(FLAT_FILE, line, { encoding: "utf-8" });

      res.status(201).json({
        success: true,
        message: "Data saved successfully.",
        submission: {
          timestamp,
          name: name.trim(),
          email: email.trim(),
          comments: cleanComments,
        }
      });
    } catch (err) {
      console.error("Error writing to submissions.txt:", err);
      res.status(500).json({ error: "Could not write to submissions file." });
    }
  });

  // API Route: Clear submissions (useful utility for flat file testing)
  app.post("/api/submissions/clear", (req, res) => {
    try {
      fs.writeFileSync(FLAT_FILE, "", "utf-8");
      res.json({ success: true, message: "Storage cleared successfully." });
    } catch (err) {
      console.error("Error clearing submissions.txt:", err);
      res.status(500).json({ error: "Could not clear submissions file." });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
