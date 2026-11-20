export const config = {

    SERVER_PORT: 3000,
    MYSQL_HOST: process.env.MYSQL_HOST || "127.0.0.1",
    MYSQL_USER: process.env.MYSQL_USER || "",
    MYSQL_PASSWORD: process.env.MYSQL_PASSWORD || "",
    MYSQL_DB: process.env.MYSQL_DB || "",
    MYSQL_PORT: 3306,


    USER_TRADE_TABLES: 1,

    REDIS_ADDR: process.env.REDIS_ADDR || "127.0.0.1",
    REDIS_PORT: 6379,

    JWT_KEY: process.env.JWT_KEY || "",
    JWT_EXPIRED_TIME: 86400, //24小时

    HOST: process.env.HOST || "",
    HOST_PORT: 9002,

    MINI_APP_ID: process.env.MINI_APP_ID || "",
    MINI_APP_SECRET: process.env.MINI_APP_SECRET || "",
    MIN_APP_MCHID: process.env.MIN_APP_MCHID || "",
    MIN_APP_APIV3KEY: process.env.MIN_APP_APIV3_KEY || "",
    RPC_SERVER: process.env.RPC_SERVER || "",

    QINIU_ACCESS: process.env.QINIU_ACCESS || "",
    QINIU_SECRET: process.env.QINIU_SECRET || "",
    QINIU_BUCKET: process.env.QINIU_BUCKET || "",
    QINIU_HOST: process.env.QINIU_HOST || "",
    QINIU_DOMAIN: process.env.QINIU_DOMAIN || "",
    QINIU_FILE_PATH_BASE: process.env.QINIU_FILE_PATH_BASE || ""
}
