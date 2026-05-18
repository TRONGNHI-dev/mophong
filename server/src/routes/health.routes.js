import { Router } from "express";
import { getPool, sql } from "../config/db.js";

const router = Router();

router.get("/", async (_req, res, next) => {
  try {
    const pool = await getPool();
    const result = await pool.request().query("SELECT DB_NAME() AS database_name");

    res.json({
      status: "ok",
      database: result.recordset[0]?.database_name ?? null,
      driver: sql?.version ?? "mssql"
    });
  } catch (error) {
    next(error);
  }
});

export { router as healthRouter };
