export type TokenData = {
    token: string
}

export type ResponseData = {
    msg: string
    data: any
}

export type rpcResult = {
    code: number
    msg: string
    data: {
        result: string
        lastId: number
    } | null
}

export type JWTUserInfo = {
    id: number
    role: number
}

export const ROLES = {
  ADMIN: 1, //管理员
  PROVINCE: 2,//省
  CITY: 3, //市
  DISTRICT: 4,///区
  TOWN: 5,//镇
  STREET: 6,//街
  PROVIDER: 7,//服务商
  COMPANY: 8,//企业
  ASSOCIATION: 9,  //协会
  MARKET: 10,//经纪人
};