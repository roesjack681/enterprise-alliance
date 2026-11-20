//分类模型结构体定义
export type categoryModel = {
    id: number,
    name: string,
    icon: string,
    sort: number,
    pid: number,
    status: number,
    remark: string
}

export type categoryTreeModel = {
    id: number,
    name: string,
    icon: string,
    sort: number,
    pid: number,
    status: number,
    remark: string,
    children?: categoryTreeModel[]
} 