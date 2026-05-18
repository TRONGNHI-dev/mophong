import { Router } from "express";
import { getPool } from "../config/db.js";
import { hashPassword, isPasswordHash, verifyPassword } from "../utils/password.js";
import { createToken } from "../utils/token.js";

const router = Router();

router.post("/register", async (req, res, next) => {
  try {
    const { fullName, email, password, passwordHash, phone, roleCode = "student" } = req.body;
    const submittedPassword = password || passwordHash;
    const normalizedEmail = email?.trim().toLowerCase();
    const normalizedFullName = fullName?.trim();

    if (!normalizedFullName || !normalizedEmail || !submittedPassword) {
      return res.status(400).json({ message: "Thiếu họ tên, email hoặc mật khẩu." });
    }

    if (submittedPassword.length < 8) {
      return res.status(400).json({ message: "Mật khẩu phải có ít nhất 8 ký tự." });
    }

    const pool = await getPool();

    const roleResult = await pool
      .request()
      .input("code", roleCode)
      .query("SELECT TOP 1 ma FROM vai_tro WHERE ma_code = @code");

    if (!roleResult.recordset.length) {
      return res.status(400).json({ message: "Role không hợp lệ." });
    }

    const roleId = roleResult.recordset[0].ma;

    const insertResult = await pool
      .request()
      .input("roleId", roleId)
      .input("fullName", normalizedFullName)
      .input("email", normalizedEmail)
      .input("phone", phone || null)
      .input("passwordHash", hashPassword(submittedPassword))
      .query(`
        INSERT INTO nguoi_dung (vai_tro_id, ho_ten, thu_dien_tu, dien_thoai, mat_khau_bam)
        OUTPUT INSERTED.ma AS id, INSERTED.ho_ten AS full_name, INSERTED.thu_dien_tu AS email, INSERTED.trang_thai AS status
        VALUES (@roleId, @fullName, @email, @phone, @passwordHash)
      `);

    return res.status(201).json({
      message: "Tạo tài khoản thành công.",
      user: insertResult.recordset[0]
    });
  } catch (error) {
    if (String(error.message).includes("UQ__nguoi_dung") || String(error.message).includes("duplicate")) {
      return res.status(409).json({ message: "Email đã tồn tại." });
    }
    next(error);
  }
});

router.post("/login", async (req, res, next) => {
  try {
    const { email, password, passwordHash } = req.body;
    const submittedPassword = password || passwordHash;
    const normalizedEmail = email?.trim().toLowerCase();

    if (!normalizedEmail || !submittedPassword) {
      return res.status(400).json({ message: "Thiếu email hoặc mật khẩu." });
    }

    const pool = await getPool();
    const result = await pool
      .request()
      .input("email", normalizedEmail)
      .query(`
        SELECT u.ma AS id,
               u.ho_ten AS full_name,
               u.thu_dien_tu AS email,
               u.mat_khau_bam AS password_hash,
               v.ma_code AS role_code
        FROM dbo.nguoi_dung u
        JOIN dbo.vai_tro v ON u.vai_tro_id = v.ma
        WHERE u.thu_dien_tu = @email
      `);

    if (!result.recordset.length) {
      return res.status(401).json({ message: "Email hoặc mật khẩu không đúng." });
    }

    const user = result.recordset[0];
    const legacyPasswordMatches = !isPasswordHash(user.password_hash) && submittedPassword === user.password_hash;
    const passwordMatches = verifyPassword(submittedPassword, user.password_hash) || legacyPasswordMatches;

    if (!passwordMatches) {
      return res.status(401).json({ message: "Email hoặc mật khẩu không đúng." });
    }

    if (legacyPasswordMatches) {
      await pool
        .request()
        .input("userId", user.id)
        .input("passwordHash", hashPassword(submittedPassword))
        .query("UPDATE dbo.nguoi_dung SET mat_khau_bam = @passwordHash WHERE ma = @userId");
    }

    const token = createToken({
      id: user.id,
      fullName: user.full_name,
      email: user.email,
      role: user.role_code
    });

    return res.json({
      message: "Đăng nhập thành công.",
      token,
      user: {
        id: user.id,
        fullName: user.full_name,
        email: user.email,
        role: user.role_code
      }
    });
  } catch (error) {
    next(error);
  }
});

export { router as authRouter };
