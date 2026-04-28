// ===== SERVER NODEJS (Express) =====
// Cách chạy local:
// 1. npm init -y
// 2. npm install express cors body-parser
// 3. node server.js

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// ===== DATABASE (memory tạm, deploy sẽ reset) =====
let orders = [];
let qrCount = 1;

// ===== TẠO ĐƠN =====
app.post('/create-order', (req, res) => {
  const { user, amount } = req.body;

  if (!user || !amount) {
    return res.json({ error: 'Thiếu dữ liệu' });
  }

  const code = 'NKCSIREX' + String(qrCount).padStart(4, '0');
  qrCount++;

  const order = {
    id: 'DH' + Date.now(),
    user,
    amount,
    code,
    status: 'pending'
  };

  orders.push(order);

  res.json(order);
});

// ===== LẤY ĐƠN =====
app.get('/orders/:user', (req, res) => {
  const user = req.params.user;
  const result = orders.filter(o => o.user === user);
  res.json(result);
});

// ===== ADMIN DUYỆT =====
app.post('/approve', (req, res) => {
  const { id } = req.body;
  let o = orders.find(x => x.id === id);
  if (o) {
    o.status = 'done';
    return res.json({ success: true });
  }
  res.json({ success: false });
});

// ===== AUTO CHECK (GIẢ LẬP) =====
app.post('/auto-check', (req, res) => {
  const { code } = req.body;
  let o = orders.find(x => x.code === code);
  if (o) {
    o.status = 'done';
    return res.json({ matched: true });
  }
  res.json({ matched: false });
});

// ===== START =====
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('Server chạy tại port ' + PORT));


// ===== HƯỚNG DẪN DEPLOY (RENDER FREE) =====
/*
1. Vào https://render.com
2. New → Web Service
3. Connect GitHub (upload code này lên repo trước)
4. Chọn repo
5. Build command: npm install
6. Start command: node server.js
7. Deploy

Sau khi xong sẽ có link API:
https://your-app.onrender.com

DÙNG TRONG FRONTEND:
POST /create-order
GET /orders/:user
POST /approve
POST /auto-check
*/
