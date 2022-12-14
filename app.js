// @ts-check

const Koa = require('koa');
const websokify = require('koa-websocket');
const route = require('koa-route');
const serve = require('koa-static');
const mount = require('koa-mount');

const Pug = require('koa-pug');
// 상대경로나 절대경로 처리
const path = require('path');

const mongoClient = require('./public/mongo');

const _client = mongoClient.connect();

const app = websokify(new Koa());

const PORT = 4500;

app.use(mount('/public', serve('public')));

const pug = new Pug({
  viewPath: path.resolve(__dirname, './views'),
  app,
});

app.ws.use(
  route.all('/chat', async (ctx) => {
    // console.log(app.ws);
    const { server } = app.ws;

    const client = await _client;
    const cursor = client.db('kdt1').collection('chats');

    const chats = cursor.find(
      {},
      {
        sort: {
          // 1이면 오름 차순 -1 이면 내림차순
          createdAt: 1,
        },
      }
    );
    const chatsData = await chats.toArray();
    // 접속한 사람한테만
    ctx.websocket.send(
      JSON.stringify({
        type: 'sync',
        data: {
          chatsData,
        },
      })
    );
    server?.clients.forEach((client) => {
      // client.send('모든 클라이언트에게 데이터를 보낸다 실시');
      client.send(
        JSON.stringify({
          type: 'chat',
          data: {
            name: '서버',
            msg: `새로운 유저가 참여했습니다. 현재 유저 수 ${server?.clients.size}`,
            bg: 'bg-danger',
            text: 'text-white',
          },
        })
      );
    });
    // 클라이언트에게 보내는것 send()
    // ctx.websocket.send('아아 들리십니까 여긴 서버입니다');
    ctx.websocket.on('message', async (message) => {
      const chat = JSON.parse(message);
      // 여기서 재미있는거
      const insertClient = await _client;
      const chatCursor = insertClient.db('kdt1').collection('chats');
      await chatCursor.insertOne({
        // name: chat.name,
        // msg: chat.msg,
        // bg: chat.bg,
        // text: chat.text,
        ...chat, // 위에꺼랑 똑같은 말임. ㅎㅎ 전개연산자
        createdAt: new Date(),
      });
      server?.clients.forEach((client) => {
        client.send(
          JSON.stringify({
            type: 'chat',
            data: { ...chat },
          })
        );
      });
    });
    ctx.websocket.on('close', (message) => {
      server?.clients.forEach((client) => {
        // client.send('모든 클라이언트에게 데이터를 보낸다 실시');
        client.send(
          JSON.stringify({
            type: 'chat',
            data: {
              name: '서버',
              msg: `유저 한명이 나갔습니다. 현재 유저 수 ${server?.clients.size}`,
              bg: 'bg-dark',
              text: 'text-white',
            },
          })
        );
      });
    });
  })
);
app.use(async (ctx, next) => {
  await ctx.render('chat');
});

app.listen(PORT, () => {
  console.log(`서버는 ${PORT}에서 작동 중입니다.`);
});
