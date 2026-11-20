import crypto = require("crypto");
import { Response } from "express"
import { validationResult } from "express-validator";
import * as jwt from "jsonwebtoken"
import { JWTUserInfo } from "../modules/admin/proto";
import axios, { AxiosResponse, AxiosError } from 'axios';
import { config } from "../config/config";

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
        code = 1;
    } else if ("token" == slug) {
        code = 5;
    } else {
        code = 0;
    }

    response = {
        code: code,
        data: data,
        msg: msg,
    };
    return response;
};

export const httpSuccessPagination = (res: Response, draw: number, records_total: number, records_filtered: number, data: object) => {
    return res.status(200).json({
        code: 1,
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

export const httpTokenError = (res: Response, msg: string) => {
    let response = _createResponse("token", null, msg);
    return res.status(400).json(response);
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

        return http400Error(res, "请检查必填参数");
    };
};

/**
 * 系统角色枚举
 * @description 定义系统中所有可用的角色类型及其对应的数值
 */
export enum RoleType {
    ADMIN = 1, // 管理员角色
    PROVINCE = 2, // 省级角色
    CITY = 3, // 市级角色
    DISTRICT = 4, // 区级角色
    TOWN = 5, // 镇级角色
    STREET = 6, // 街道级角色
    PROVIDER = 7, // 供应商角色
    COMPANY = 8, // 企业角色
    ASSOCIATION = 9 // 协会角色
}
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
    let data = jwt.decode(token);
    if (data && typeof data === "object" && "data" in data) {
        return {
            id: <number>data["data"]["id"],
            username: <string>data["data"]["username"],
            realname: <string>data["data"]["realname"],
            role_id: <number>data["data"]["role_id"],
            mch_id: <number>data["data"]["mch_id"], //部门ID
        }
    }
    return null;
}

export const httpGet = async (url: string, params?: Record<string, any>) => {
    return await axios.get(url, { params });
}
export const axiosGet = async (url: string, config?: any) => {
    try {
        const response = await axios.get(url, config);
        return response;
    } catch (error) {
        console.error(`获取数据失败:`, error.message);
    }

}
export const httpPost = async (url: string, data: any, config?: any) => {
    return await axios.post(url, data, config)
}
// http://192.168.1.28:3000/select|
export const sendJsonRpcRequest = async (url: string, data: { sql: string, params: any[] }): Promise<any> => {
    //url: string,
    return new Promise<any>((resolve, reject) => {
        axios.post(config.RPC_SERVER + url, data)
            .then((response: AxiosResponse) => {
                //console.log('rpc222',response)  
                const responseData: JsonRpcResponse = response.data;
                if (responseData.result) {
                    resolve(responseData.result);
                } else if (responseData.error) {
                    reject(new Error(responseData.error.message));
                } else {
                    reject(new Error('无效 JSON-RPC response'));
                }
            })
            .catch((error: AxiosError) => {
                console.log('rpc222', error)
                // reject(new Error(error.message));
                resolve({ code: 0, msg: error.message });
            });
    });
}

export const randString = async (num: number): Promise<string> => {
    let str: string = ""
    for (let i = 0; i < num; i++) {
        str += strArr[Math.floor(Math.random() * strArr.length)]
    }
    return str
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

export const handleException = (res: Response, error: unknown, location: string = "") => {
    if (location) {
        console.error(`❌ Error in ${location}:`, error);
    } else {
        console.error(`❌ Unexpected error:`, error);
    }
    return http400Error(res, 'Internal server error');
};

export const rpcPost = async (url: string, data: any, token?: string) => { 
    try {
        const response = await axios.post(config.RPC_SERVER + url, data, { 
             headers: {
                "Content-Type": "application/json",
                "token": token ?? "",
                }
         });    
        return response.data;
    } catch (error) {         
        return {code: 1, msg: error.response?.data?.msg || error.message}   
    } 
};