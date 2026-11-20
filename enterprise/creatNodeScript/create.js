const ejs = require('ejs');
const fs = require('fs');
/**
 * 生成使用node+express+jsonwebtoken+sequelize+mysql框架的CURD操作脚本代码
 * */
//--------------输入修改数据------------------ 
const data = {
    modelName: 'province', // 一般写表名
    tableName: 'province', // 数据库表名    
    fields: [
        { name: 'id', type: 'number' },
        { name: 'code', type: 'number' },
        { name: 'name', type: 'string' },
        { name: 'province', type: 'string' },
        { name: 'city', type: 'string' },
        { name: 'district', type: 'string' },
        { name: 'town', type: 'string' },

    ]

}
//---------------------------------
async function main() {
    const arr = ['api.ts', 'form.ts', 'proto.ts', 'service.ts']
    //for(let i=0;i<arr.length;i++)
    //fs.unlink(`./out/${data.modelName}/${arr[i]}`, (e) => {}); 
    // fs.mkdir(`./out/${data.modelName}`,(e)=>{
    //    console.log(e)
    // }); 
    fs.mkdirSync(`./out/${data.modelName}`, { recursive: true });
    for (let i = 0; i < arr.length; i++) {
        const template = fs.readFileSync(`./template/${arr[i]}`, 'utf8');
        const html = ejs.render(template, data);
        const filename = `./out/${data.modelName}/${arr[i]}`
        fs.writeFileSync(filename, html, 'utf8');
    }
    console.log(`脚本生成成功：./out/${data.modelName}目录查看`)
}
main()