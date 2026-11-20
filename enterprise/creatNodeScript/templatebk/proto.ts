//模型结构体定义
export type <%=modelName%>Model = {
    <%for(let i=0;i<fields.length;i++){%>
    <%=fields[i].name%>:<%=fields[i].type%>,<%}%>
}
