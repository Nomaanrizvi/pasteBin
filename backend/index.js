import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { nanoid } from "nanoid";
import { sql } from "./db.js";
import { body, validationResult } from "express-validator";

const app = express();

/* ===============================
   Middlewares
================================= */

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: "200kb" }));

const limiter = rateLimit({
    windowMs: 60 * 1000,
    max: 30
});

app.use(limiter);

/* ===============================
   Create Paste
================================= */

app.post(
    "/api/pastes",

    body("content").isString().isLength({ min: 1, max: 20000 }),
    body("expireAfterViews").optional().isInt({ min: 1 }),
    body("expireAfterSeconds").optional().isInt({ min: 1 }),

    async (req, res) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { content, expireAfterViews, expireAfterSeconds } = req.body;

        const id = nanoid(10);

        let expires_at = null;

        if (expireAfterSeconds) {
            expires_at = new Date(
                Date.now() + expireAfterSeconds * 1000
            ).toISOString();
        }

        const remaining_views = expireAfterViews || null;

        try {
            await sql`
        INSERT INTO pastes (id, content, expires_at, remaining_views)
        VALUES (${id}, ${content}, ${expires_at}, ${remaining_views})
      `;

            return res.status(201).json({
                id,

                url: `${process.env.FRONTEND_ORIGIN || "http://localhost:5173"}/p/${id}`,

                raw_url: `${process.env.BACKEND_ORIGIN || "http://localhost:4000"}/api/pastes/${id}/raw`,

                expires_at
            });
        } catch (err) {
            console.error(err);

            return res.status(500).json({
                error: "server_error"
            });
        }
    }
);

/* ===============================
   Utility (No Transaction)
================================= */

async function getPasteAndMaybeDecrement(id, decrement = true) {
    try {
        /* Get paste */
        const rows = await sql`
      SELECT *
      FROM pastes
      WHERE id = ${id}
    `;

        if (rows.length === 0) {
            return { status: 404 };
        }

        const paste = rows[0];

        /* Deleted */
        if (paste.is_deleted) {
            return { status: 410 };
        }

        /* Time expiry */
        if (paste.expires_at && new Date(paste.expires_at) <= new Date()) {
            await sql`
        UPDATE pastes
        SET is_deleted = true
        WHERE id = ${id}
      `;

            return { status: 410 };
        }

        /* View expiry */
        if (paste.remaining_views !== null && decrement) {
            const newViews = paste.remaining_views - 1;

            if (newViews <= 0) {
                await sql`
          UPDATE pastes
          SET remaining_views = 0,
              is_deleted = true
          WHERE id = ${id}
        `;
            } else {
                await sql`
          UPDATE pastes
          SET remaining_views = ${newViews}
          WHERE id = ${id}
        `;
            }

            paste.remaining_views = Math.max(0, newViews);
        }

        return { status: 200, paste };
    } catch (err) {
        console.error(err);

        return { status: 500 };
    }
}

/* ===============================
   JSON GET
================================= */

app.get("/api/pastes/:id", async (req, res) => {
    const id = req.params.id;

    const result = await getPasteAndMaybeDecrement(id, true);

    if (result.status === 404) {
        return res.status(404).json({ error: "Paste not found" });
    }

    if (result.status === 410) {
        return res.status(410).json({ error: "Paste expired or deleted" });
    }

    if (result.status === 500) {
        return res.status(500).json({ error: "server_error" });
    }

    const p = result.paste;

    return res.json({
        id: p.id,
        content: p.content,
        created_at: p.created_at,
        expires_at: p.expires_at,
        remaining_views: p.remaining_views
    });
});

/* ===============================
   RAW GET
================================= */

app.get("/api/pastes/:id/raw", async (req, res) => {
    const id = req.params.id;

    const result = await getPasteAndMaybeDecrement(id, true);

    if (result.status === 404) {
        return res.status(404).send("Paste not found");
    }

    if (result.status === 410) {
        return res.status(410).send("Paste expired or deleted");
    }

    if (result.status === 500) {
        return res.status(500).send("Server error");
    }

    res.setHeader("Content-Type", "text/plain; charset=utf-8");

    res.send(result.paste.content);
});

/* ===============================
   Server
================================= */

const port = process.env.PORT || 4000;

app.listen(port, () => {
    console.log(`Server running on ${port}`);
});
