import { Router } from "express";
import { getPool } from "../config/db.js";

const router = Router();

async function getDefaultSession(pool) {
  const result = await pool.request().query(`
    SELECT TOP 1 ma AS id, mo_phong_id AS simulation_id FROM phien_mo_phong ORDER BY ma ASC
  `);
  return result.recordset[0] || null;
}

router.get("/", async (req, res, next) => {
  try {
    const { status } = req.query;
    const pool = await getPool();
    let query = `
      SELECT
        i.ma AS id,
        i.phien_mo_phong_id AS session_id,
        i.mo_phong_id AS simulation_id,
        i.ma_mat_hang AS item_code,
        i.ten_mat_hang AS item_name,
        i.loai_mat_hang AS item_type,
        i.don_vi AS unit,
        i.ton_kho_hien_tai AS current_stock,
        i.ton_kho_toi_thieu AS minimum_stock,
        i.ton_kho_toi_da AS maximum_stock,
        i.don_gia AS unit_cost,
        i.ngay_het_han AS expiry_date,
        i.trang_thai AS status,
        i.ngay_tao AS created_at,
        i.ngay_cap_nhat AS updated_at,
        ss.tieu_de AS session_title,
        s.ten AS simulation_name
      FROM kho_hang i
      LEFT JOIN phien_mo_phong ss ON ss.ma = i.phien_mo_phong_id
      LEFT JOIN mo_phong s ON s.ma = i.mo_phong_id
    `;

    if (status) {
      query += ` WHERE i.trang_thai = @status `;
    }

    query += ` ORDER BY i.ma DESC `;

    const requestBuilder = pool.request();
    if (status) {
      requestBuilder.input("status", status);
    }

    const result = await requestBuilder.query(query);
    res.json(result.recordset);
  } catch (error) {
    next(error);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const {
      sessionId,
      simulationId,
      itemCode,
      itemName,
      itemType,
      unit,
      currentStock,
      minimumStock,
      maximumStock,
      unitCost,
      expiryDate,
      status
    } = req.body;

    if (!itemCode || !itemName || !itemType || !unit) {
      return res.status(400).json({ message: "Thiếu itemCode, itemName, itemType hoặc unit." });
    }

    const pool = await getPool();
    let finalSessionId = sessionId;
    let finalSimulationId = simulationId;

    if (!finalSessionId || !finalSimulationId) {
      const defaultSession = await getDefaultSession(pool);
      if (!defaultSession) {
        return res.status(400).json({ message: "Không có phiên mặc định để gán item." });
      }
      if (!finalSessionId) finalSessionId = defaultSession.id;
      if (!finalSimulationId) finalSimulationId = defaultSession.simulation_id;
    }

    const result = await pool
      .request()
      .input("sessionId", finalSessionId)
      .input("simulationId", finalSimulationId)
      .input("itemCode", itemCode)
      .input("itemName", itemName)
      .input("itemType", itemType)
      .input("unit", unit)
      .input("currentStock", currentStock || 0)
      .input("minimumStock", minimumStock || 0)
      .input("maximumStock", maximumStock || null)
      .input("unitCost", unitCost || 0)
      .input("expiryDate", expiryDate || null)
      .input("status", status || "normal")
      .query(`
        INSERT INTO kho_hang (
          phien_mo_phong_id, mo_phong_id, ma_mat_hang, ten_mat_hang, loai_mat_hang, don_vi,
          ton_kho_hien_tai, ton_kho_toi_thieu, ton_kho_toi_da, don_gia, ngay_het_han, trang_thai
        )
        OUTPUT
          INSERTED.ma AS id,
          INSERTED.phien_mo_phong_id AS session_id,
          INSERTED.mo_phong_id AS simulation_id,
          INSERTED.ma_mat_hang AS item_code,
          INSERTED.ten_mat_hang AS item_name,
          INSERTED.loai_mat_hang AS item_type,
          INSERTED.don_vi AS unit,
          INSERTED.ton_kho_hien_tai AS current_stock,
          INSERTED.ton_kho_toi_thieu AS minimum_stock,
          INSERTED.ton_kho_toi_da AS maximum_stock,
          INSERTED.don_gia AS unit_cost,
          INSERTED.ngay_het_han AS expiry_date,
          INSERTED.trang_thai AS status
        VALUES (
          @sessionId, @simulationId, @itemCode, @itemName, @itemType, @unit,
          @currentStock, @minimumStock, @maximumStock, @unitCost, @expiryDate, @status
        )
      `);

    res.status(201).json({ message: "Tạo mục tồn kho thành công.", item: result.recordset[0] });
  } catch (error) {
    next(error);
  }
});

router.put("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      itemCode,
      itemName,
      itemType,
      unit,
      currentStock,
      minimumStock,
      maximumStock,
      unitCost,
      expiryDate,
      status,
      sessionId,
      simulationId
    } = req.body;

    if (!itemCode || !itemName || !itemType || !unit) {
      return res.status(400).json({ message: "Thiếu itemCode, itemName, itemType hoặc unit." });
    }

    const pool = await getPool();
    const result = await pool
      .request()
      .input("id", id)
      .input("itemCode", itemCode)
      .input("itemName", itemName)
      .input("itemType", itemType)
      .input("unit", unit)
      .input("currentStock", currentStock || 0)
      .input("minimumStock", minimumStock || 0)
      .input("maximumStock", maximumStock || null)
      .input("unitCost", unitCost || 0)
      .input("expiryDate", expiryDate || null)
      .input("status", status || "normal")
      .input("sessionId", sessionId || null)
      .input("simulationId", simulationId || null)
      .query(`
        UPDATE kho_hang
        SET
          ma_mat_hang = @itemCode,
          ten_mat_hang = @itemName,
          loai_mat_hang = @itemType,
          don_vi = @unit,
          ton_kho_hien_tai = @currentStock,
          ton_kho_toi_thieu = @minimumStock,
          ton_kho_toi_da = @maximumStock,
          don_gia = @unitCost,
          ngay_het_han = @expiryDate,
          trang_thai = @status,
          ngay_cap_nhat = SYSDATETIME(),
          phien_mo_phong_id = COALESCE(@sessionId, phien_mo_phong_id),
          mo_phong_id = COALESCE(@simulationId, mo_phong_id)
        OUTPUT
          INSERTED.ma AS id,
          INSERTED.phien_mo_phong_id AS session_id,
          INSERTED.mo_phong_id AS simulation_id,
          INSERTED.ma_mat_hang AS item_code,
          INSERTED.ten_mat_hang AS item_name,
          INSERTED.loai_mat_hang AS item_type,
          INSERTED.don_vi AS unit,
          INSERTED.ton_kho_hien_tai AS current_stock,
          INSERTED.ton_kho_toi_thieu AS minimum_stock,
          INSERTED.ton_kho_toi_da AS maximum_stock,
          INSERTED.don_gia AS unit_cost,
          INSERTED.ngay_het_han AS expiry_date,
          INSERTED.trang_thai AS status
        WHERE ma = @id
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({ message: "Không tìm thấy mục tồn kho." });
    }

    res.json({ message: "Cập nhật mục tồn kho thành công.", item: result.recordset[0] });
  } catch (error) {
    next(error);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const pool = await getPool();
    const result = await pool
      .request()
      .input("id", id)
      .query(`
        DELETE FROM kho_hang
        WHERE ma = @id
      `);

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ message: "Không tìm thấy mục tồn kho." });
    }

    res.json({ message: "Xóa mục tồn kho thành công." });
  } catch (error) {
    next(error);
  }
});

export { router as inventoryRouter };