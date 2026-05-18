import dotenv from "dotenv";

dotenv.config();

// Live binding for modules that import `sql`
let sql;

let poolPromise;

function parseServerAndInstance() {
  let envServer = process.env.DB_SERVER || "DESKTOP-QI1TR1K\\SQLEXPRESS02";
  let instanceName = process.env.DB_INSTANCE || undefined;
  if (envServer && envServer.includes("\\")) {
    const parts = envServer.split("\\");
    envServer = parts[0];
    instanceName = parts[1] || instanceName;
  }
  return { envServer, instanceName };
}

function getDefaultServer() {
  return process.env.DB_SERVER || "DESKTOP-QI1TR1K\\SQLEXPRESS02";
}

function buildSqlAuthConnectionString() {
  const server = process.env.DB_SERVER || "DESKTOP-QI1TR1K\\SQLEXPRESS02";
  const database = process.env.DB_DATABASE || "BizPracDB";
  const user = process.env.DB_USER;
  const password = process.env.DB_PASSWORD;
  const trustServerCertificate = process.env.DB_TRUST_SERVER_CERTIFICATE
    ? String(process.env.DB_TRUST_SERVER_CERTIFICATE).toLowerCase() === "true"
    : true;

  if (!user || !password) {
    return null;
  }

  if (server.includes("\\") && !process.env.DB_PORT) {
    return null;
  }

  return [
    `Server=${server}`,
    `Database=${database}`,
    `User Id=${user}`,
    `Password=${password}`,
    `Encrypt=false`,
    `TrustServerCertificate=${trustServerCertificate ? "true" : "false"}`
  ].join(";");
}

function formatSqlError(error) {
  if (!error) {
    return "Không rõ lỗi.";
  }

  if (typeof error === "string") {
    return error;
  }

  const details = [
    error.message,
    error.code,
    error.number,
    error.state,
    error.class,
    error.serverName,
    error.procName,
    error.lineNumber,
    error.originalError?.message,
    error.originalError?.info?.message,
    error.precedingErrors?.map((item) => item?.message).filter(Boolean).join("; ")
  ].filter(Boolean);

  if (details.length) {
    return details.join(" | ");
  }

  try {
    return JSON.stringify(error, Object.getOwnPropertyNames(error), 2);
  } catch {
    return String(error);
  }
}

async function loadMssqlModule(driver) {
  if (driver === "msnodesqlv8") {
    // Node ESM resolution may require the explicit .js extension inside node_modules
    try {
      const mod = await import("mssql/msnodesqlv8.js");
      return mod.default ? mod.default : mod;
    } catch (e) {
      const mod = await import("mssql/msnodesqlv8");
      return mod.default ? mod.default : mod;
    }
  }
  const mod = await import("mssql");
  return mod.default ? mod.default : mod;
}

export async function getPool() {
  if (!poolPromise) {
    const driver = process.env.DB_USER ? "mssql" : process.env.DB_DRIVER || "msnodesqlv8";
    const connString = process.env.DB_CONNECTION_STRING || buildSqlAuthConnectionString();

    const mssql = await loadMssqlModule(driver);
    // set live binding
    sql = mssql;

    if (process.env.DB_CONNECTION_STRING || connString) {
      // connect using provided connection string
      poolPromise = mssql.connect(connString).catch((error) => {
        poolPromise = undefined;
        throw new Error(formatSqlError(error));
      });
      return poolPromise;
    }

    const useWindowsAuth = driver === "msnodesqlv8" && !process.env.DB_USER;
    const { envServer, instanceName } = parseServerAndInstance();

    const dbConfig = {
      user: useWindowsAuth ? undefined : process.env.DB_USER,
      password: useWindowsAuth ? undefined : process.env.DB_PASSWORD,
      server: useWindowsAuth ? getDefaultServer() : envServer || "localhost",
      database: process.env.DB_DATABASE || "BizPracDB",
      port: Number(process.env.DB_PORT || 1433),
      options: {
        instanceName: process.env.DB_PORT ? undefined : instanceName || undefined,
        trustedConnection: useWindowsAuth,
        trustServerCertificate: process.env.DB_TRUST_SERVER_CERTIFICATE
          ? String(process.env.DB_TRUST_SERVER_CERTIFICATE).toLowerCase() === "true"
          : true,
        enableArithAbort: true
      },
      pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 30000
      }
    };

    if ((useWindowsAuth || instanceName) && !process.env.DB_PORT) {
      delete dbConfig.port;
    }

    poolPromise = mssql.connect(dbConfig).catch((error) => {
      poolPromise = undefined;
      throw new Error(formatSqlError(error));
    });
  }
  return poolPromise;
}

export { sql };
