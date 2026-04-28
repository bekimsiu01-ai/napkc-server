// ===== IMPORT =====
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// ===== TEST =====
app.get('/', (req, res) => {
  res.send('SERVER OK');
});

// ===== DATA =====
let orders = [];
let qrCount = 1;

// ===== TẠO ĐƠN =====
app.post('/create-order', (req, res) => {
  const { user, amount } = req.body;

  if (!user || !amount) {
    return res.json({ error: 'Thiếu user hoặc amount' });
  }

  const code = 'NKCSIREX' + String(qrCount).padStart(4, '0');
  qrCount++;

  const order = {
    id: 'DH' + Date.now(),
    user,
    amount,
    code,
    status: 'pending',
    time: new Date()
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

// ===== DUYỆT =====
app.post('/approve', (req, res) => {
  const { id } = req.body;

  let order = orders.find(o => o.id === id);
  if (order) {
    order.status = 'done';
    return res.json({ success: true });
  }

  res.json({ success: false });
});

// ===== AUTO CHECK =====
app.post('/auto-check', (req, res) => {
  const { code } = req.body;

  let order = orders.find(o => o.code === code);
  if (order) {
    order.status = 'done';
    return res.json({ matched: true });
  }

  res.json({ matched: false });
});

// ===== START =====
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log('Server chạy tại port ' + PORT);
});
