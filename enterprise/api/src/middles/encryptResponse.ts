import { Response, Request, NextFunction } from 'express';
import { Encrypt } from '../common/aes256Encryption';

export function encryptResponse(req: Request, res: Response, next: NextFunction) {
    // 缓存原始 res.json 方法
    const originalJson = res.json.bind(res);

    res.json = (body: any) => {
        try {
            // 统一包装加密后的数据
            const encrypted = Encrypt(JSON.stringify(body));
            return originalJson({ data: encrypted });
        } catch (error) {
            // console.error('响应加密失败:', error);
            return originalJson({
                error: 'response encryption failed',
                detail: (error as Error).message
            });
        }
    };

    next();
}
