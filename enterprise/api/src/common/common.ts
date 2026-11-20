import crypto = require("crypto");
import {Response} from "express"
import {header, validationResult} from "express-validator";
import {JWTUserInfo} from "../modules/app/proto";
import axios, { AxiosResponse, AxiosError } from 'axios'; 
import { config } from "../config/config"; 
import {getLang} from "../lang";
interface JsonRpcRequest {
    jsonrpc: string;
    method: string;
    params: any[];
    id: number;
}

interface JsonRpcResponse {
    jsonrpc: string;
    result?: any;
    error?: {
        code: number;
        message: string;
        data?: any;
    };
    id: number;
}

export interface IResponse {
    code: number;
    msg: string;
    data: any;
}

const _createResponse = (slug: string, data: any, msg: string): IResponse => {
    let response: IResponse;
    let code: number;

    if ("success" == slug) {
        code = 0;
    } else if ("token" == slug) {
        code = 5;
    } else {
        code = 1;
    }

    response = {
        code: code,
        data: data,
        msg: msg,
    };
    return response;
};

export const httpSuccessPagination = (res: Response, draw: number,records_total: number,records_filtered: number,data: object) => {
    return res.status(200).json({
        code: 0,
        draw: draw,
        recordsTotal: records_total,
        recordsFiltered: records_filtered,
        data: data,
        msg: "SUCCESS"
    })
}

export const httpSuccess = (res: Response, data: any, msg: string) => {
    let response = _createResponse("success", data, msg);
    return res.status(200).json(response);
};

export const http400Error = (res: Response, msg: string) => {
    let response = _createResponse("400", null, msg);
    return res.status(400).json(response);
};

export const http502Error = (res: Response, msg: string) => {
    let response = _createResponse("502", null, msg);
    return res.status(502).json(response);
};

export const httpTokenError = (res: Response) => {
    let response = _createResponse("token", null, "Token not avaliable");
    return res.status(400).json(response);
};
// ---------------------- 响应统一处理封装 ----------------------

/**
 * 通用结果处理器，基于 result.msg 自动返回成功或错误响应
 * @param res Express Response 对象
 * @param result service 层返回的结果对象 { msg: string, data: any }
 * @param langMap msg 与国际化 key 的映射关系，例如: { ok: 'login_success', err: 'login_failed' }
 * @returns HTTP 响应
 */
export const handleResult = (res: Response,result: { msg: string; data?: any },langMap: Record<string, string>) => {
  const msg = result.msg || "default";
  const langKey = langMap[msg] || (msg === "ok" ? "success" : "server_error");
  return msg === "ok"? httpSuccess(res, result.data, getLang(langKey)): http400Error(res, getLang(langKey));
};
export const handleException = (res: Response, error: unknown, location: string = "") => {
    if (location) {
        console.error(`❌ Error in ${location}:`, error);
    } else {
        console.error(`❌ Unexpected error:`, error);
    }
    return http400Error(res, getLang('server_error'));
};
export const validate = (validations: any[]) => {
    return async (
        req: any,
        res: any,
        next: any,
    ): Promise<any> => {
        await Promise.all(validations.map((validation) => validation.run(req)));
        //validation.run is not a function
        
        const errors = validationResult(req);
        if (errors.isEmpty()) {
            return next();
        }
        // errors.array() ---------body("username").notEmpty(),
        return http400Error(res, getLang("validation_error"));
    };
};

export const md5Encode = async (raw: string | number): Promise<string> => {
    let md5Str: string;
    if (typeof raw === "number") {
        raw = raw.toString();
    }
    md5Str = crypto.createHash("md5").update(raw).digest("hex");
    return md5Str;
};

export const sha256Encode = async (raw: string): Promise<string> => {
    let sha256Str: string;
// Create a SHA256 hash object
    const hash = crypto.createHash('sha256');
// Update the hash with the data to be hashed
    hash.update(raw);
// Generate the hash in hexadecimal format
    sha256Str = hash.digest('hex');
    return sha256Str.toUpperCase()
};


export const decodeJWT = async (token: string): Promise<JWTUserInfo | null> => {    
    let res = await rpcPost('/auth/parse-token', { token },token);       
    if (res.code !== 0 || !res.data?.id) {
        throw new Error("error token");
    }
    //console.log('decodeJWT',res.data)
    
    return {
        id: res.data.id as number,
        role: res.data.role as number,
    };
}

export const httpGet = async (url: string, config?: any) => {  
    try {         
        const response= await axios.get(url,config);  
        return response.data;
    } catch (error) {
       return {code:1,msg:error.message}      
    }
    
}
export const httpPost = async (url: string,data:any, config?: any)=> { 
    try {         
        const response= await axios.post(url,data,config)       
        return response.data;       
    } catch (error) { 
        return {code:1,msg:error.message}   
    } 
}

export const rpcsGet = async (url: string, config?: any) => {  
    try {         
        const response= await axios.get(config.rpc_server+url,config);  
        return response;
    } catch (error) {
        return {code:1,msg:error.response.data.msg|| error.message}        
    }
    
}
export const rpcPost = async (url: string,data:any,token?:string)=> { 
    try {

        
        //token select 和role-sign-in方法不强制要求，其他方法都需要token，建议如非公开查询方法，建议select操作也带 token 
        const response= await axios.post(config.rpc_server+ url,data,{ 
             headers: {
                "Content-Type": "application/json",
                "token": token ?? "",  // 更明确的写法
                }
         });    
        return response.data;
    } catch (error) {         
        return {code:1,msg:error.response?.data?.msg|| error.message}   
    } 
}



export const randString = async (num: number):Promise<string> => {
    let str: string = ""
    for (let i=0;i<num;i++){
        str += strArr[Math.floor(Math.random() * strArr.length)]
    }
    return str
}
// Caesar 加密算法
export const caesarEncrypt=(text:string, key:number=54352355):string=>{
    const alphabet = '7rtyaix8ojd4l2w5m|sfgz3z0hn6vc1peqtbu9k';
    let encrypted = '';
    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      const index = alphabet.indexOf(char);
      if (index !== -1) {
        const newIndex = (index + key) % alphabet.length;
        encrypted += alphabet[newIndex];
      } else {
        encrypted += char;
      }
    }
    return encrypted;
} 
// Caesar 解密算法
export const  caesarDecrypt=(encryptedText:string, key:number=54352355):string=>{
    const alphabet = '7rtyaix8ojd4l2w5m|sfgz3z0hn6vc1peqtbu9k';
    let decrypted = '';
    for (let i = 0; i < encryptedText.length; i++) {
      const char = encryptedText[i];
      const index = alphabet.indexOf(char);
      if (index !== -1) {
        let newIndex = (index - key) % alphabet.length;
        if (newIndex < 0) {
          newIndex += alphabet.length;
        }
        decrypted += alphabet[newIndex];
      } else {
        decrypted += char;
      }
    }
    return decrypted;
}

const strArr: string[] = [
    'a',
    'b',
    'c',
    'd',
    'e',
    'f',
    'g',
    'h',
    'i',
    'j',
    'k',
    'l',
    'm',
    'n',
    'o',
    'p',
    'q',
    'r',
    's',
    't',
    'u',
    'v',
    'w',
    'x',
    'y',
    'z',
    '1',
    '2',
    '3',
    '4',
    '5',
    '6',
    '7',
    '8',
    '9',
    'H',
    'I',
    'J',
    'K',
    'L',
    'M',
    'N',
    'P',
    'R',
    'S',
];