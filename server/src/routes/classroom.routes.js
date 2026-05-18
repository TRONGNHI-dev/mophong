import { Router } from "express";
import { getPool } from "../config/db.js";

const router = Router();

router.get("/", async (_req, res, next) => {
  try {
    const pool = await getPool();
    const result = await pool.request().query(`
      SELECT
        c.ma AS id,
        c.ten AS name,
        c.ma_code AS code,
        c.trang_thai AS status,
        c.ngay_bat_dau AS start_date,
        c.ngay_ket_thuc AS end_date,
        o.ten AS organization_name,
        u.ho_ten AS instructor_name
      FROM lop_hoc c
      LEFT JOIN to_chuc o ON o.ma = c.to_chuc_id
      LEFT JOIN nguoi_dung u ON u.ma = c.nguoi_day_id
      ORDER BY c.ma DESC
    `);

    res.json(result.recordset);
  } catch (error) {
    next(error);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const { organizationId, name, code, instructorId, startDate, endDate, description } = req.body;

    if (!organizationId || !name || !code) {
      return res.status(400).json({ message: "Thiếu organizationId, name hoặc code." });
    }

    const pool = await getPool();
    const result = await pool
      .request()
      .input("organizationId", organizationId)
      .input("name", name)
      .input("code", code)
      .input("description", description || null)
      .input("instructorId", instructorId || null)
      .input("startDate", startDate || null)
      .input("endDate", endDate || null)
      .query(`
        INSERT INTO lop_hoc (
          to_chuc_id, ten, ma_code, mo_ta, nguoi_day_id, ngay_bat_dau, ngay_ket_thuc
        )
        OUTPUT INSERTED.ma AS id, INSERTED.ten AS name, INSERTED.ma_code AS code, INSERTED.trang_thai AS status
        VALUES (
          @organizationId, @name, @code, @description, @instructorId, @startDate, @endDate
        )
      `);

    res.status(201).json({
      message: "Tạo lớp học thành công.",
      classroom: result.recordset[0]
    });
  } catch (error) {
    next(error);
  }
});

export { router as classroomRouter };
