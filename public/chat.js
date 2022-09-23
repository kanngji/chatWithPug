// @ts-check

// public .eslintrc.js 에서 browser: true
(() => {
  const socket = new WebSocket(`ws://${window.location.host}/chat`);

  const btn = document.getElementById('btn');
  const inputEl = document.querySelector('#input');
  const chatEl = document.getElementById('chat');

  const adj = [
    '1',
    '2',
    '3',
    '4',
    '5',
    '6',
    '7',
    '8',
    '9',
    '10',
    '11',
    '12',
    '13',
    '14',
    '15',
    '16',
    '17',
    '18',
    '19',
    '20',
  ];
  const member = [
    '유림님',
    '지훈님',
    '한솔님',
    '윤비님',
    '승환님',
    '영은님',
    '수지님',
    '종익님',
    '혜영님',
    '준우님',
    '진형님',
    '민정님',
    '소민님',
    '지현님',
    '다영님',
    '세영님',
    '의진님',
    '승수님',
    '해성님',
    '허원님',
  ];
  const bootColor = [
    { bg: 'bg-primary', text: 'text-white' },
    { bg: 'bg-success', text: 'text-white' },
    { bg: 'bg-warning', text: 'text-black' },
    { bg: 'bg-info', text: 'text-white' },
    { bg: 'alert-primary', text: 'text-black' },
    { bg: 'alert-secondary', text: 'text-black' },
    { bg: 'alert-success', text: 'text-black' },
    { bg: 'alert-danger', text: 'text-black' },
    { bg: 'alert-warning', text: 'text-black' },
    { bg: 'alert-info', text: 'text-black' },
  ];

  function pickRandomArr(arr) {
    const randomIndex = Math.floor(Math.random() * arr.length);

    return arr[randomIndex];
  }
  const thema = pickRandomArr(bootColor);

  const nickName = `${pickRandomArr(adj)} ${pickRandomArr(member)}`;
  btn?.addEventListener('click', () => {
    const msg = inputEl.value;
    const data = {
      name: nickName,
      msg,
      bg: thema.bg,
      text: thema.text,
    };
    socket.send(JSON.stringify(data));
    inputEl.value = '';
  });
  const chats = [];

  function drawChats(type, data) {
    if (type === 'sync') {
      chatEl.innerHTML = '';
      chats.forEach(({ name, msg, bg, text }) => {
        const msgEl = document.createElement('p');
        msgEl.innerText = `${name} : ${msg}`;
        msgEl.classList.add('p-2');
        msgEl.classList.add(bg);
        msgEl.classList.add(text);

        msgEl.classList.add('fw-bold');
        chatEl.appendChild(msgEl);

        // 스크롤 기능
        chatEl.scrollTop = chatEl.scrollHeight - chatEl.clientHeight;
      });
    } else if (type === 'chat') {
      const msgEl = document.createElement('p');
      msgEl.innerText = `${data.name} : ${data.msg}`;
      msgEl.classList.add('p-2');
      msgEl.classList.add(data.bg);
      msgEl.classList.add(data.text);

      msgEl.classList.add('fw-bold');
      chatEl.appendChild(msgEl);

      // 스크롤 기능
      chatEl.scrollTop = chatEl.scrollHeight - chatEl.clientHeight;
    }
  }
  inputEl?.addEventListener('keyup', (event) => {
    if (event.keyCode === 13) {
      btn?.click();
    }
  });
  socket.addEventListener('open', () => {
    // socket.send('안녕하세욧 저는 클라이언트에요!');
  });

  socket.addEventListener('message', (event) => {
    const msgData = JSON.parse(event.data);
    const { type, data } = msgData;
    if (type === 'sync') {
      const oldChats = data.chatsData;
      chats.push(...oldChats);
      drawChats(type, data);
    } else if (type === 'chat') {
      chats.push(data);
      drawChats(type, data);
    }

    // const msgEl = document.createElement('p');
    // msgEl.innerText = `${name} : ${msg}`;
    // msgEl.classList.add('p-2');
    // msgEl.classList.add(bg);
    // msgEl.classList.add(text);

    // msgEl.classList.add('fw-bold');
    // chatEl.appendChild(msgEl);

    // // 스크롤 기능
    // chatEl.scrollTop = chatEl.scrollHeight - chatEl.clientHeight;
  });
})();
