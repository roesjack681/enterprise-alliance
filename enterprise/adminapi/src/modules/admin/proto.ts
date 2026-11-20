//模型结构体定义
export type adminModel = {
    
    id:number,
    role_id:number,
    mch_id:number,
    username:string,
    password:string,
    realname:string,
    mobile:string,
    email:string,
    create_time:number,
    status:number,
    access:Array<any>,
    access_name:string
}
export type JWTUserInfo = {
    id: number,
    username: string,
    realname: string,
    role_id: number,
    mch_id: number, //部门ID
}
