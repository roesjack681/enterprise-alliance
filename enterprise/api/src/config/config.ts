

export const config = {
    SERVER_PORT: 3000,
    USER_TRADE_TABLES: 1,
    REDIS_ADDR: process.env.REDIS_ADDR || "127.0.0.1",
    REDIS_PORT: 6379,
    JWT_KEY: process.env.JWT_KEY || "",
    JWT_EXPIRED_TIME: 86400, 
    
    MINI_APP_ID: process.env.MINI_APP_ID || "",
    MINI_APP_SECRET: process.env.MINI_APP_SECRET || "",

    WX_PAY_APPID: process.env.WX_PAY_APPID || "",
    WX_PAY_MCHID: process.env.WX_PAY_MCHID || "",
    WX_PAY_API_KEY: process.env.WX_PAY_API_KEY || "",
    WX_PAY_NOTIFY_URL: process.env.WX_PAY_NOTIFY_URL || "",
    
    rpc_server: process.env.RPC_SERVER || "",
    MONGODB_URI: process.env.MONGODB_URI || "mongodb://127.0.0.1:27017",
    MONGODB_USER: process.env.MONGODB_USER || "",
    MONGODB_PASS: process.env.MONGODB_PASS || "",
    
    TENCENT_SMS: {
        SECRET_ID: process.env.TENCENT_SECRET_ID || "腾讯云SecretId",
        SECRET_KEY: process.env.TENCENT_SECRET_KEY || "腾讯云SecretKey",
        SDK_APP_ID: process.env.TENCENT_SMS_SDK_APP_ID || "短信应用ID",
        SIGN_NAME: process.env.TENCENT_SMS_SIGN_NAME || "短信签名",
        TEMPLATE_ID: process.env.TENCENT_SMS_TEMPLATE_ID || "短信模板ID",
        REGION: process.env.REGION || "ap-guangzhou"
    }

};

