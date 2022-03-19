const koa=require('koa');
const bodyParser=require('koa-bodyparser')
const Router=require('koa-router');
const fs=require('fs')
const path=require('path')
const os=require('os')
const crypto=require('@wecom/crypto');

const FileType =require('file-type') 
const addon = require('wework-chat-node');

const moment=require('moment')

const WebSocket = require('ws');
const http=require('http')
const views=require('koa-views')

let websocket=null

const gettextPath=path.join(__dirname,'get.txt')
const posttextPath=path.join(__dirname,'post.txt')
const chattextPath=path.join(__dirname,'chat.txt')



const private_key=fs.readFileSync('private.pem').toString()
// console.log(private_key,'私钥')
// 创建 sdk 对象
const wework = new addon.WeWorkChat({
  corpid: "ww0f3d2f1a76f5a960", // 企业id
  secret:"XHeceZ27mbNpeQfffB8NKt7op6tjlfMA2JTpITYZF00",
  private_key, // 私钥，用于消息解密
  seq: "0", // 数据拉取index,第一次从0开始
});

// 实例化koa
const app=new koa();
const router=new Router();

const encodingAESKey='jb0gh762kjNEh9ZNjlwtQxbd5R9FuWDxqbKrvkQJOW9'

//post参数
app.use(bodyParser())
//渲染html
app.use(views(path.join(__dirname,'views/'),{extension:"ejs"}))

// 路由
router.get("/",async ctx=>{

    ctx.body={msg:"Hello Koa Interfaces"};
    
})

// 路由
router.post("/data",async ctx=>{
    // console.log(ctx.request.body,'请求参数',+new Date())
    const s=`响应时间:${moment(new Date()).format('YYYY-MM-DD HH:mm:ss')}，请求参数:${JSON.stringify(ctx.request.body)}`+os.EOL
    fs.appendFileSync(posttextPath,s)
    await wework.fetchData(callData)

    ctx.body={msg:s};
})

router.get("/data",async ctx=>{
    
    const echostr=ctx.query.echostr||''
    console.log(echostr,'echostr')
    let msg={message:''}
    if(echostr){
        msg=crypto.decrypt(encodingAESKey,echostr)
    }
    // console.log(ctx.request.body,'请求参数',+new Date(),msg)
    const s=`响应时间:${moment(new Date()).format('YYYY-MM-DD HH:mm:ss')}，请求参数:${JSON.stringify(ctx.request.body)}，消息:${JSON.stringify(msg)}`+os.EOL

    fs.appendFileSync(gettextPath,s)
    
    //必须返回解码信息
    ctx.body=msg.message;
})

router.get("/get_chat",async ctx=>{
    
    const s=fs.readFileSync(chattextPath).toString().split(os.EOL).reverse().join(os.EOL+os.EOL)

    // ctx.body=s
    await ctx.render('index',{
        data:s
    })
})

// 配置路由
app.use(router.routes()).use(router.allowedMethods());

const port=process.env.PORT || 5000;

const server = http.createServer(app.callback())

const wss = new WebSocket.Server({// 同一个端口监听不同的服务
    server
});

wsUtil(wss)

server.listen(port)


// 获取聊天数据回调函数
async function callData (msg){
    // 需要去重一下，后续再排查原因
    try {
        const msgObj = JSON.parse(msg);
        // const msgType = msgObj.msgtype;
        const msgid=msgObj.msgid
        const fstring=fs.readFileSync(chattextPath).toString()

        if(fstring.includes(`"msgid":"${msgid}"`)){
            // console.log('重复了')
            return
        }

        const s=`响应时间:${moment(new Date()).format('YYYY-MM-DD HH:mm:ss')},消息:${msg}`+os.EOL
        fs.appendFileSync(chattextPath,s)
        

    } catch (error) {
        console.log("parse data error:",error);
    }
    
}

//websocket逻辑

function wsUtil(wss){
    wss.on('connection', function connection(ws) {
        ws.on('message', function incoming(message) {
            console.log('收到：received: %s', message);

            
            
        });
        //监听文件变化
        fs.watch(chattextPath,(_,filename)=>{
            if (filename){
                console.log(`${filename}文件发生更新`)
                const s=fs.readFileSync(chattextPath).toString().split(os.EOL).reverse().join(os.EOL+os.EOL)
                ws.send(s);
            }
        })
        
    });
}

