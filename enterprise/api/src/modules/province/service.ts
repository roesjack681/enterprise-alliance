import { provinceModel } from "./proto";
import { rpcPost } from "../../common/common";
import { ResponseData, TokenData, rpcResult } from "../app/proto";

export interface IprovinceService<TokenData> {
  listProvince(): Promise<ResponseData>;
  listCity(provinceCode: string): Promise<ResponseData>;
  listDistrict(provinceCode: string, cityCode: string): Promise<ResponseData>;
  listTown(
    provinceCode: string,
    cityCode: string,
    districtCode: string
  ): Promise<ResponseData>;
}

// ======================== 省市区服务相关 ========================

export class provinceService implements IprovinceService<TokenData> {
    protected token: string;
    constructor(tokenData: TokenData) {
        this.token = tokenData.token;
    }

    /**
     * 获取省份列表
     */
    async listProvince(): Promise<ResponseData> {
        try {
            const sql = `SELECT id, code, name, province, city, district, town FROM province WHERE city = 0 AND district = 0 AND town = 0`;
            const params = [];
            const res = <rpcResult>(
                await rpcPost("/select", { sql, params }, this.token)
            );
            if (res && res.code === 0) {
                const data: provinceModel[] = JSON.parse(res.data.result);
                return {
                    msg: data.length ? "ok" : "not_found",
                    data: data.length ? data : null,
                };
            } else {
                return { msg: "err", data: null };
            }
        } catch (error) {
            return { msg: "server_error", data: null };
        }
    }
    async listCity(provinceCode: string): Promise<ResponseData> {
        try {
            const isDirectProvince = ["11", "12", "31", "50"].includes(provinceCode);
            const sql = isDirectProvince
                ? `SELECT id, code, name, province, city, district, town FROM province
                WHERE province = ? AND district != 0 AND town = 0`
                : `SELECT id, code, name, province, city, district, town FROM province
                WHERE province = ? AND city != 0 AND district = 0 AND town = 0`;

            const params = [provinceCode];
            const res = <rpcResult>(
                await rpcPost("/select", { sql, params }, this.token)
            );
            if (res && res.code === 0) {
                const data: provinceModel[] = JSON.parse(res.data.result);
                return {
                    msg: data.length ? "ok" : "not_found",
                    data: data.length ? data : null,
                };
            } else {
                return { msg: "err", data: null };
            }
        } catch (error) {
            return { msg: "server_error", data: null };
        }
    }
    async listDistrict(
        provinceCode: string,
        cityCode: string
    ): Promise<ResponseData> {
        try {
            const sql = `SELECT id, code, name, province, city, district, town FROM province
                WHERE province = ? AND city = ? AND district != 0 AND town = 0`;
            const params = [provinceCode, cityCode];
            const res = <rpcResult>(
                await rpcPost("/select", { sql, params }, this.token)
            );
            if (res && res.code === 0) {
                const data: provinceModel[] = JSON.parse(res.data.result);
                return {
                    msg: data.length ? "ok" : "not_found",
                    data: data.length ? data : null,
                };
            } else {
                return { msg: "err", data: null };
            }
        } catch (error) {
            return { msg: "server_error", data: null };
        }
    }
    async listTown(
        provinceCode: string,
        cityCode: string,
        districtCode: string
    ): Promise<ResponseData> {
        try {
            const sql = `SELECT id, code, name, province, city, district, town
                FROM province WHERE province = ? AND city = ? AND district = ? AND town != 0`;
            const params = [provinceCode, cityCode, districtCode];
            const res = <rpcResult>(
                await rpcPost("/select", { sql, params }, this.token)
            );
            if (res && res.code === 0) {
                const data: provinceModel[] = JSON.parse(res.data.result);
                return {
                    msg: data.length ? "ok" : "not_found",
                    data: data.length ? data : null,
                };
            } else {
                return { msg: "err", data: null };
            }
        } catch (error) {
            return { msg: "server_error", data: null };
        }
    }
}
