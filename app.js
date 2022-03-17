const koa=require('koa');
const bodyParser=require('koa-bodyparser')
const Router=require('koa-router');
const fs=require('fs')
const path=require('path')
const os=require('os')

const gettextPath=path.join(__dirname,'get.txt')
const posttextPath=path.join(__dirname,'post.txt')

// 实例化koa
const app=new koa();
const router=new Router();

app.use(bodyParser())

// 路由
router.get("/",async ctx=>{
    console.log(ctx.query)
    const s=`时间：${+new Date()}，请求参数：${ctx.query}`+os.EOL
    fs.appendFileSync(textPath,s)
    ctx.body={msg:"Hello Koa Interfaces"};
})

// 路由
router.post("/data",async ctx=>{
    console.log(ctx.request.body,'请求参数',+new Date())
    const s=`时间：${+new Date()}，请求参数：${JSON.stringify(ctx.request.body)}`+os.EOL
    fs.appendFileSync(posttextPath,s)
    ctx.body={msg:ctx.request.body};
})

router.get("/data",async ctx=>{
    console.log(ctx.request.body,'请求参数',+new Date())
    const s=`时间：${+new Date()}，请求参数：${JSON.stringify(ctx.request.body)}`+os.EOL
    fs.appendFileSync(gettextPath,s)
    ctx.body={msg:ctx.request.body};
})

// 配置路由
app.use(router.routes()).use(router.allowedMethods());

const port=process.env.PORT || 5000;

app.listen(port,()=>{
    console.log(`server started on ${port}`)
})
