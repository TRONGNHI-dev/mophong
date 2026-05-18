import { verifyToken } from "../utils/token.js";

export function requireAuth(req, res, next) {
  const authorization = req.headers.authorization || "";
  const [scheme, token] = authorization.split(" ");

  if (scheme !== "Bearer" || !token) {
    return res.status(401).json({ message: "Bạn cần đăng nhập để thực hiện thao tác này." });
  }

  const payload = verifyToken(token);
  if (!payload) {
    return res.status(401).json({ message: "Phiên đăng nhập không hợp lệ hoặc đã hết hạn." });
  }

  req.user = payload;
  next();
}

export function requireRoles(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user?.role)) {
      return res.status(403).json({ message: "Bạn không có quyền thực hiện thao tác này." });
    }

    next();
  };
}
