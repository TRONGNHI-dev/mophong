import { Router } from "express";
import { getPool } from "../config/db.js";
import { requireAuth, requireRoles } from "../middleware/auth.middleware.js";

const router = Router();
const canManageSessions = requireRoles("admin", "teacher");

function toPositiveNumber(value) {
  const numberValue = Number(value);
  return Number.isInteger(numberValue) && numberValue > 0 ? numberValue : null;
}

function toOptionalDate(value) {
  if (!value) {
    return null;
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

function validateSessionTimes(startAt, endAt) {
  if (startAt === undefined || endAt === undefined) {
    return "Ngày bắt đầu hoặc kết thúc không hợp lệ.";
  }

  if (startAt && endAt && endAt < startAt) {
    return "Ngày kết thúc không được nhỏ hơn ngày bắt đầu.";
  }

  return null;
}

router.use(requireAuth);

router.get("/", async (_req, res, next) => {
  try {
    const pool = await getPool();
    const result = await pool.request().query(`
      SELECT
        ss.ma AS id,
        ss.tieu_de AS title,
        ss.trang_thai AS status,
        ss.bat_dau AS start_at,
        ss.ket_thuc AS end_at,
        s.ten AS simulation_name,
        sc.tieu_de AS scenario_title,
        c.ten AS classroom_name
      FROM phien_mo_phong ss
      INNER JOIN mo_phong s ON s.ma = ss.mo_phong_id
      LEFT JOIN kich_ban sc ON sc.ma = ss.kich_ban_id
      LEFT JOIN lop_hoc c ON c.ma = ss.lop_hoc_id
      ORDER BY ss.ma DESC
    `);

    res.json(result.recordset);
  } catch (error) {
    next(error);
  }
});

router.post("/", canManageSessions, async (req, res, next) => {
  try {
    const {
      simulationId,
      scenarioId,
      classroomId,
      organizationId,
      title,
      startAt,
      endAt,
      maxParticipants,
      notes
    } = req.body;
    const normalizedTitle = title?.trim();
    const normalizedSimulationId = toPositiveNumber(simulationId);
    const normalizedScenarioId = scenarioId ? toPositiveNumber(scenarioId) : null;
    const normalizedClassroomId = classroomId ? toPositiveNumber(classroomId) : null;
    const normalizedOrganizationId = organizationId ? toPositiveNumber(organizationId) : null;
    const normalizedMaxParticipants = maxParticipants ? toPositiveNumber(maxParticipants) : null;
    const normalizedStartAt = toOptionalDate(startAt);
    const normalizedEndAt = toOptionalDate(endAt);
    const timeError = validateSessionTimes(normalizedStartAt, normalizedEndAt);

    if (!normalizedSimulationId || !normalizedTitle) {
      return res.status(400).json({ message: "Thiếu simulationId hoặc title hợp lệ." });
    }

    if (scenarioId && !normalizedScenarioId) {
      return res.status(400).json({ message: "scenarioId không hợp lệ." });
    }

    if (classroomId && !normalizedClassroomId) {
      return res.status(400).json({ message: "classroomId không hợp lệ." });
    }

    if (organizationId && !normalizedOrganizationId) {
      return res.status(400).json({ message: "organizationId không hợp lệ." });
    }

    if (maxParticipants && !normalizedMaxParticipants) {
      return res.status(400).json({ message: "maxParticipants phải là số nguyên dương." });
    }

    if (timeError) {
      return res.status(400).json({ message: timeError });
    }

    const pool = await getPool();
    const result = await pool
      .request()
      .input("simulationId", normalizedSimulationId)
      .input("scenarioId", normalizedScenarioId)
      .input("classroomId", normalizedClassroomId)
      .input("organizationId", normalizedOrganizationId)
      .input("createdBy", req.user.id)
      .input("title", normalizedTitle)
      .input("startAt", normalizedStartAt)
      .input("endAt", normalizedEndAt)
      .input("maxParticipants", normalizedMaxParticipants)
      .input("notes", notes || null)
      .query(`
        INSERT INTO phien_mo_phong (
          mo_phong_id, kich_ban_id, lop_hoc_id, to_chuc_id,
          nguoi_tao, tieu_de, bat_dau, ket_thuc, so_nguoi_toi_da, ghi_chu
        )
        OUTPUT INSERTED.ma AS id, INSERTED.tieu_de AS title, INSERTED.trang_thai AS status
        VALUES (
          @simulationId, @scenarioId, @classroomId, @organizationId,
          @createdBy, @title, @startAt, @endAt, @maxParticipants, @notes
        )
      `);

    res.status(201).json({
      message: "Tạo phiên mô phỏng thành công.",
      session: result.recordset[0]
    });
  } catch (error) {
    next(error);
  }
});

router.put("/:id", canManageSessions, async (req, res, next) => {
  try {
    const sessionId = Number(req.params.id);
    const { title, startAt, endAt, maxParticipants, notes } = req.body;
    const normalizedTitle = title ? title.trim() : null;
    const normalizedStartAt = toOptionalDate(startAt);
    const normalizedEndAt = toOptionalDate(endAt);
    const normalizedMaxParticipants = maxParticipants ? toPositiveNumber(maxParticipants) : null;
    const timeError = validateSessionTimes(normalizedStartAt, normalizedEndAt);

    if (!sessionId) {
      return res.status(400).json({ message: "Thiếu id của phiên." });
    }

    if (title && !normalizedTitle) {
      return res.status(400).json({ message: "title không hợp lệ." });
    }

    if (maxParticipants && !normalizedMaxParticipants) {
      return res.status(400).json({ message: "maxParticipants phải là số nguyên dương." });
    }

    if (timeError) {
      return res.status(400).json({ message: timeError });
    }

    const pool = await getPool();
    const result = await pool
      .request()
      .input("sessionId", sessionId)
      .input("title", normalizedTitle)
      .input("startAt", normalizedStartAt)
      .input("endAt", normalizedEndAt)
      .input("maxParticipants", normalizedMaxParticipants)
      .input("notes", notes || null)
      .query(`
        UPDATE phien_mo_phong
        SET
          tieu_de = COALESCE(@title, tieu_de),
          bat_dau = COALESCE(@startAt, bat_dau),
          ket_thuc = COALESCE(@endAt, ket_thuc),
          so_nguoi_toi_da = COALESCE(@maxParticipants, so_nguoi_toi_da),
          ghi_chu = COALESCE(@notes, ghi_chu)
        OUTPUT INSERTED.ma AS id, INSERTED.tieu_de AS title, INSERTED.trang_thai AS status
        WHERE ma = @sessionId
      `);

    if (!result.recordset.length) {
      return res.status(404).json({ message: "Không tìm thấy ca để cập nhật." });
    }

    res.json({ message: "Cập nhật ca thành công.", session: result.recordset[0] });
  } catch (error) {
    next(error);
  }
});

router.delete("/:id", canManageSessions, async (req, res, next) => {
  try {
    const sessionId = Number(req.params.id);

    if (!sessionId) {
      return res.status(400).json({ message: "Thiếu id của phiên." });
    }

    const pool = await getPool();
    const result = await pool
      .request()
      .input("sessionId", sessionId)
      .query(`DELETE FROM phien_mo_phong WHERE ma = @sessionId`);

    if (!result.rowsAffected[0]) {
      return res.status(404).json({ message: "Không tìm thấy ca để xóa." });
    }

    res.json({ message: "Xóa ca thành công." });
  } catch (error) {
    next(error);
  }
});

export { router as sessionRouter };
