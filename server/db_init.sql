-- db_init.sql
-- Tập lệnh khởi tạo cơ sở dữ liệu SQL Server cho dự án inapp.
-- Chạy tập lệnh này trong ngữ cảnh cơ sở dữ liệu mục tiêu.

SET NOCOUNT ON;

-- Xóa các bảng đã tồn tại theo thứ tự phụ thuộc khóa ngoại.
IF OBJECT_ID('dbo.kho_hang', 'U') IS NOT NULL DROP TABLE dbo.kho_hang;
IF OBJECT_ID('dbo.phien_mo_phong', 'U') IS NOT NULL DROP TABLE dbo.phien_mo_phong;
IF OBJECT_ID('dbo.kich_ban', 'U') IS NOT NULL DROP TABLE dbo.kich_ban;
IF OBJECT_ID('dbo.mo_phong', 'U') IS NOT NULL DROP TABLE dbo.mo_phong;
IF OBJECT_ID('dbo.lop_hoc', 'U') IS NOT NULL DROP TABLE dbo.lop_hoc;
IF OBJECT_ID('dbo.nguoi_dung', 'U') IS NOT NULL DROP TABLE dbo.nguoi_dung;
IF OBJECT_ID('dbo.to_chuc', 'U') IS NOT NULL DROP TABLE dbo.to_chuc;
IF OBJECT_ID('dbo.vai_tro', 'U') IS NOT NULL DROP TABLE dbo.vai_tro;

-- Tạo bảng vai_tro
CREATE TABLE dbo.vai_tro (
  ma INT IDENTITY(1,1) PRIMARY KEY,
  ma_code NVARCHAR(50) NOT NULL UNIQUE,
  ten_hien_thi NVARCHAR(100) NOT NULL,
  mo_ta NVARCHAR(500) NULL,
  ngay_tao DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
  ngay_cap_nhat DATETIME2 NOT NULL DEFAULT SYSDATETIME()
);

-- Tạo bảng to_chuc
CREATE TABLE dbo.to_chuc (
  ma INT IDENTITY(1,1) PRIMARY KEY,
  ten NVARCHAR(255) NOT NULL,
  ma_code NVARCHAR(100) NOT NULL UNIQUE,
  mo_ta NVARCHAR(MAX) NULL,
  trang_thai NVARCHAR(50) NOT NULL DEFAULT 'active',
  ngay_tao DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
  ngay_cap_nhat DATETIME2 NOT NULL DEFAULT SYSDATETIME()
);

-- Tạo bảng nguoi_dung
CREATE TABLE dbo.nguoi_dung (
  ma INT IDENTITY(1,1) PRIMARY KEY,
  vai_tro_id INT NOT NULL,
  ho_ten NVARCHAR(255) NOT NULL,
  thu_dien_tu NVARCHAR(255) NOT NULL UNIQUE,
  dien_thoai NVARCHAR(50) NULL,
  mat_khau_bam NVARCHAR(512) NOT NULL,
  trang_thai NVARCHAR(50) NOT NULL DEFAULT 'active',
  ngay_tao DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
  ngay_cap_nhat DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
  CONSTRAINT FK_nguoi_dung_vai_tro FOREIGN KEY (vai_tro_id) REFERENCES dbo.vai_tro(ma)
);

-- Tạo bảng lop_hoc
CREATE TABLE dbo.lop_hoc (
  ma INT IDENTITY(1,1) PRIMARY KEY,
  to_chuc_id INT NOT NULL,
  ten NVARCHAR(255) NOT NULL,
  ma_code NVARCHAR(100) NOT NULL UNIQUE,
  mo_ta NVARCHAR(MAX) NULL,
  nguoi_day_id INT NULL,
  ngay_bat_dau DATE NULL,
  ngay_ket_thuc DATE NULL,
  trang_thai NVARCHAR(50) NOT NULL DEFAULT 'active',
  ngay_tao DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
  ngay_cap_nhat DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
  CONSTRAINT FK_lop_hoc_to_chuc FOREIGN KEY (to_chuc_id) REFERENCES dbo.to_chuc(ma),
  CONSTRAINT FK_lop_hoc_nguoi_day FOREIGN KEY (nguoi_day_id) REFERENCES dbo.nguoi_dung(ma)
);

-- Tạo bảng mo_phong
CREATE TABLE dbo.mo_phong (
  ma INT IDENTITY(1,1) PRIMARY KEY,
  ten NVARCHAR(255) NOT NULL,
  ma_code NVARCHAR(100) NOT NULL UNIQUE,
  mo_ta NVARCHAR(MAX) NULL,
  trang_thai NVARCHAR(50) NOT NULL DEFAULT 'active',
  ngay_tao DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
  ngay_cap_nhat DATETIME2 NOT NULL DEFAULT SYSDATETIME()
);

-- Tạo bảng kich_ban
CREATE TABLE dbo.kich_ban (
  ma INT IDENTITY(1,1) PRIMARY KEY,
  mo_phong_id INT NOT NULL,
  tieu_de NVARCHAR(255) NOT NULL,
  ma_code NVARCHAR(100) NOT NULL,
  mo_ta NVARCHAR(MAX) NULL,
  trang_thai NVARCHAR(50) NOT NULL DEFAULT 'active',
  ngay_tao DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
  ngay_cap_nhat DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
  CONSTRAINT FK_kich_ban_mo_phong FOREIGN KEY (mo_phong_id) REFERENCES dbo.mo_phong(ma),
  CONSTRAINT UQ_kich_ban_mo_phong_code UNIQUE (mo_phong_id, ma_code)
);

-- Tạo bảng phien_mo_phong
CREATE TABLE dbo.phien_mo_phong (
  ma INT IDENTITY(1,1) PRIMARY KEY,
  mo_phong_id INT NOT NULL,
  kich_ban_id INT NULL,
  lop_hoc_id INT NULL,
  to_chuc_id INT NULL,
  nguoi_tao INT NOT NULL,
  tieu_de NVARCHAR(255) NOT NULL,
  bat_dau DATETIME2 NULL,
  ket_thuc DATETIME2 NULL,
  so_nguoi_toi_da INT NULL,
  ghi_chu NVARCHAR(MAX) NULL,
  trang_thai NVARCHAR(50) NOT NULL DEFAULT 'draft',
  ngay_tao DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
  ngay_cap_nhat DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
  CONSTRAINT FK_phien_mo_phong_mo_phong FOREIGN KEY (mo_phong_id) REFERENCES dbo.mo_phong(ma),
  CONSTRAINT FK_phien_mo_phong_kich_ban FOREIGN KEY (kich_ban_id) REFERENCES dbo.kich_ban(ma),
  CONSTRAINT FK_phien_mo_phong_lop_hoc FOREIGN KEY (lop_hoc_id) REFERENCES dbo.lop_hoc(ma),
  CONSTRAINT FK_phien_mo_phong_to_chuc FOREIGN KEY (to_chuc_id) REFERENCES dbo.to_chuc(ma),
  CONSTRAINT FK_phien_mo_phong_nguoi_tao FOREIGN KEY (nguoi_tao) REFERENCES dbo.nguoi_dung(ma)
);

-- Tạo bảng kho_hang
CREATE TABLE dbo.kho_hang (
  ma INT IDENTITY(1,1) PRIMARY KEY,
  phien_mo_phong_id INT NOT NULL,
  mo_phong_id INT NOT NULL,
  ma_mat_hang NVARCHAR(100) NOT NULL,
  ten_mat_hang NVARCHAR(255) NOT NULL,
  loai_mat_hang NVARCHAR(100) NOT NULL,
  don_vi NVARCHAR(50) NOT NULL,
  ton_kho_hien_tai DECIMAL(18,2) NOT NULL DEFAULT 0,
  ton_kho_toi_thieu DECIMAL(18,2) NOT NULL DEFAULT 0,
  ton_kho_toi_da DECIMAL(18,2) NULL,
  don_gia DECIMAL(18,2) NOT NULL DEFAULT 0,
  ngay_het_han DATE NULL,
  trang_thai NVARCHAR(50) NOT NULL DEFAULT 'normal',
  ngay_tao DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
  ngay_cap_nhat DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
  CONSTRAINT FK_kho_hang_phien_mo_phong FOREIGN KEY (phien_mo_phong_id) REFERENCES dbo.phien_mo_phong(ma),
  CONSTRAINT FK_kho_hang_mo_phong FOREIGN KEY (mo_phong_id) REFERENCES dbo.mo_phong(ma),
  CONSTRAINT UQ_kho_hang_ma_mat_hang UNIQUE (phien_mo_phong_id, ma_mat_hang)
);

-- Dữ liệu mẫu khởi tạo
INSERT INTO dbo.vai_tro (ma_code, ten_hien_thi, mo_ta)
VALUES
  ('student', 'Sinh viên', 'Vai trò học viên'),
  ('instructor', 'Giảng viên', 'Vai trò giảng viên'),
  ('admin', 'Quản trị viên', 'Vai trò quản trị hệ thống');

INSERT INTO dbo.to_chuc (ten, ma_code, mo_ta)
VALUES
  ('Tổ chức mặc định', 'DEFAULT', 'Tổ chức mặc định cho hệ thống');

INSERT INTO dbo.mo_phong (ten, ma_code, mo_ta)
VALUES
  ('Mô phỏng chuỗi cung ứng', 'SUPPLY_CHAIN', 'Mô phỏng chuỗi cung ứng mẫu');

INSERT INTO dbo.kich_ban (mo_phong_id, tieu_de, ma_code, mo_ta)
VALUES
  (1, 'Kịch bản cơ bản', 'BASIC', 'Kịch bản mô phỏng cơ bản');

INSERT INTO dbo.nguoi_dung (vai_tro_id, ho_ten, thu_dien_tu, dien_thoai, mat_khau_bam)
VALUES
  (3, 'Quản trị hệ thống', 'admin@example.com', '+84000000000', 'admin123');

INSERT INTO dbo.lop_hoc (to_chuc_id, ten, ma_code, mo_ta, nguoi_day_id)
VALUES
  (1, 'Lớp mẫu', 'CLASS_001', 'Lớp học mẫu cho hệ thống', NULL);

INSERT INTO dbo.phien_mo_phong (
  mo_phong_id, kich_ban_id, lop_hoc_id, to_chuc_id, nguoi_tao, tieu_de, bat_dau, ket_thuc, so_nguoi_toi_da, ghi_chu
)
VALUES
  (1, 1, 1, 1, 1, 'Phiên mô phỏng mẫu', SYSDATETIME(), DATEADD(day, 7, SYSDATETIME()), 30, 'Phiên mô phỏng mẫu khởi tạo');

INSERT INTO dbo.kho_hang (
  phien_mo_phong_id, mo_phong_id, ma_mat_hang, ten_mat_hang, loai_mat_hang, don_vi, ton_kho_hien_tai, ton_kho_toi_thieu, ton_kho_toi_da, don_gia, ngay_het_han, trang_thai
)
VALUES
  (1, 1, 'ITEM001', 'Nguyên vật liệu mẫu', 'Vật tư', 'cái', 100, 10, 200, 5.50, DATEADD(month, 12, GETDATE()), 'normal');
