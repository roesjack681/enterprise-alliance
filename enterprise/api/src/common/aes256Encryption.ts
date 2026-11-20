import CryptoJS from 'crypto-js';
// 默认密钥和 IV，Base64 编码,请不要修改，用于api数据的加密，前端解密
const defaultKey = process.env.AES256_KEY || '';
const defaultIv = process.env.AES256_IV || '';

/**
 * AES 加密,
 * @param str 要加密的明文字符串
 * @param ikey Base64 格式密钥
 * @param iiv Base64 格式 IV
 * @returns Base64 加密结果
 */
export function Encrypt(str: string, ikey: string = defaultKey, iiv: string = defaultIv): string {
    const key = CryptoJS.enc.Base64.parse(ikey);
    const iv = CryptoJS.enc.Base64.parse(iiv);

    const encrypted = CryptoJS.AES.encrypt(str, key, {
        iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
    });

    return encrypted.toString(); // 返回 Base64 字符串
}

/**
 * AES 解密
 * @param str 加密后的密文 Base64 字符串
 * @param ikey Base64 格式密钥
 * @param iiv Base64 格式 IV
 * @returns 解密后的原文字符串
 */
export function Decrypt(str: string, ikey: string = defaultKey, iiv: string = defaultIv): string {
    const key = CryptoJS.enc.Base64.parse(ikey);
    const iv = CryptoJS.enc.Base64.parse(iiv);

    const decrypted = CryptoJS.AES.decrypt(str, key, {
        iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
    });

    return CryptoJS.enc.Utf8.stringify(decrypted);
}

// 盐值是否固定

//通过时间戳和随机数生成一个6位数盐值
export function generateSalt(): string {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000000);
    return (timestamp + random).toString().slice(7, 13);
}

//通过盐值和手机号哈希以后转换的数值生成一个随机11位用户名
export function generateUsername(salt: number, phone: number): string {
    const hash = CryptoJS.SHA256(phone);
    const num = parseInt(hash,30);
    const username = (salt + num).toString().replace(/\D/g, '').slice(0, 11);
    return username;
}