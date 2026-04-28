const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const SECRET = "SIREX_SECRET";

// dữ liệu tạm
let users = [];
let orders = [];
let qrCount = 1;

// tạo admin mặc định
(async ()=>{
  let hash = await bcrypt.hash('MinhKhiem&08',10);
  users.push({
    username:'admin',
    password:hash,
    role:'admin'
  });
})();

// ===== ĐĂNG KÝ =====
app.post('/register', async (req,res)=>{
  let {username,password} = req.body;

  if(users.find(u=>u.username===username)){
    return res.json({error:'Tồn tại'});
  }

  let hash = await bcrypt.hash(password,10);

  users.push({
    username,
    password:hash,
    role:'user'
  });

  res.json({success:true});
});

// ===== ĐĂNG NHẬP =====
app.post('/login', async (req,res)=>{
  let {username,password} = req.body;

  let user = users.find(u=>u.username===username);
  if(!user) return res.json({error:'Sai tài khoản'});

  let ok = await bcrypt.compare(password,user.password);
  if(!ok) return res.json({error:'Sai mật khẩu'});

  let token = jwt.sign({
    username:user.username,
    role:user.role
  }, SECRET);

  res.json({token});
});

// ===== CHECK TOKEN =====
function auth(req,res,next){
  let token = req.headers.authorization;
  if(!token) return res.sendStatus(401);

  try{
    req.user = jwt.verify(token, SECRET);
    next();
  }catch{
    res.sendStatus(403);
  }
}

// ===== TẠO ĐƠN =====
app.post('/create-order', auth, (req,res)=>{
  let code = 'NKCSIREX' + String(qrCount++).padStart(4,'0');

  let order = {
    id:'DH'+Date.now(),
    user:req.user.username,
    amount:req.body.amount,
    code,
    status:'pending',
    time:Date.now()
  };

  orders.push(order);
  res.json(order);
});

// ===== ĐƠN USER =====
app.get('/orders', auth, (req,res)=>{
  res.json(orders.filter(o=>o.user===req.user.username));
});

// ===== ADMIN =====
app.get('/admin/orders', auth, (req,res)=>{
  if(req.user.role !== 'admin') return res.sendStatus(403);
  res.json(orders);
});

// ===== DUYỆT =====
app.post('/approve', auth, (req,res)=>{
  let o = orders.find(x=>x.id===req.body.id);
  if(o){
    o.status='done';
    return res.json({success:true});
  }
  res.json({success:false});
});

// ===== AUTO =====
setInterval(()=>{
  orders.forEach(o=>{
    if(o.status==='pending' && Date.now()-o.time>10000){
      o.status='done';
    }
  });
},5000);

app.listen(3000,()=>console.log('Server chạy'));
