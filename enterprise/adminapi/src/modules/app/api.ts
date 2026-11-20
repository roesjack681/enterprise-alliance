import { Request, Response } from "express";
import * as service from "./service";
import { decodeJWT, httpPost, http400Error, httpSuccess, httpGet } from "../../common/common";
export const areaList = async (req: Request, res: Response) => {
    let type: number = req.body.type
    const result = await service.areaList(type)
    if (result)
        return httpSuccess(res, result, '成功');
    else
        return http400Error(res, '错误')
}
export const addArea = async (req: Request, res: Response) => {
    let code: string = req.body.code
    let name: string = req.body.name
    let parent_code: string = req.body.parent_code
    let type: number = req.body.type

    const data = { code, name, parent_code, type }
    console.log('表单数据：', data)
    const result = await service.addArea(data)
    console.log(res)
    if (result)
        return httpSuccess(res, null, '添加成功');
    else
        return http400Error(res, '添加错误')
}

export const categoryList = async (req: Request, res: Response) => {
    const result = await service.categoryList()
    return httpSuccess(res, result, '成功');
}
export const addCategory = async (req: Request, res: Response) => {

    let name: string = req.body.name
    let parent_id: number = req.body.parent_id
    let status: number = 1
    let sort: number = +req.body.sort

    const data = { name, parent_id, status, sort }
    const result = await service.addCategory(data)
    console.log(res)
    if (result)
        return httpSuccess(res, null, '添加成功');
    else
        return http400Error(res, '添加错误')
}
export const getStatistics = async (req: Request, res: Response) => {
    //let id:number=+req.body.id
    //这个将来放redis
    let id: number = 1
    const result = await service.getStatistics(id)
    return httpSuccess(res, result, '成功');
}
//推送消息到微信公众号
export const pushMsg = async (req: Request, res: Response) => {
    try {
        let title: string = req.body.title
        let content: string = req.body.content
        let addtime: number = req.body.addtime
        let source: string = req.body.source
        let sourceurl: string = req.body.sourceurl
        //外网推送无法访问，使用dcloud的云开发云函数发送推送消息
        let apiUrl = 'https://fc-mp-c3789014-f48d-4bcb-9cad-3f7d32e2a429.next.bspapp.com/pub';
        
        const params: Record<string, any> = {
            module: 'zupub',
            operation: 'tuisong',
            title:title,
            content: content,
            source: source,
            sourceurl: sourceurl
        };
        const result = await httpGet(apiUrl, params)
        if (result)
            return httpSuccess(res, null, 'ok');
        else
            return http400Error(res, 'error')
    } catch (error) {
        return http400Error(res, 'err' + error)
    }
}
export const pushMsg2 = async (req: Request, res: Response) => {
    try {
        let title: string = req.body.title
        let content: string = req.body.content
        let addtime: number = req.body.addtime
        let source: string = req.body.source
        let sourceurl: string = req.body.sourceurl

        let apiUrl = 'http://push.ijingniu.cn/send';

        let head = `${source} - ${title}`;
        let body = `${content}`;
        body += `[查看原文](${sourceurl} "查看原文")`
        const data = {
            key: '5d8c2b63eab644c7b8e5c7bb7134c034',
            head: head,
            body: body
        }
        const config={
            timeout: 30000,
            headers: {
                'content-type':'application/json',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36'
            }
        } 
        
        const result = await httpPost(apiUrl, data,config)
        if (result)
            return httpSuccess(res, null, 'ok');
        else
            return http400Error(res, 'error')
    } catch (error) {
        return http400Error(res, 'err' + error)
    }
}
