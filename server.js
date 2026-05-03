const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2');
const moment = require('moment'); // 引入 moment 库

// 创建 Express 应用
const app = express();
const port = process.env.PORT || 3000;  // 使用动态端口

// 设置 CORS 头，允许跨域访问
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");  // 允许所有域名访问
  res.setHeader("Access-Control-Allow-Methods", "*");  // 允许所有请求方法
  res.setHeader("Access-Control-Allow-Headers", "*");  // 允许所有请求头
  next();
});

// 使用 body-parser 中间件来解析 JSON 请求体
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// 创建数据库连接
const db = mysql.createConnection({
  host: process.env.DB_HOST, // 从环境变量中获取
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

// 连接到数据库
db.connect(err => {
  if (err) {
    console.error('Database connection error:', err);
    return;
  }
  console.log('Connected to the database!');
});

// 处理发布组队信息的请求，保存中国时间（CST）
app.post('/publish', (req, res) => {
  const { title, code } = req.body;
  
  // 获取当前中国时间，并转换为 ISO 格式
  const timestamp = moment().utcOffset(8).format('YYYY-MM-DD HH:mm:ss');  // 获取中国时间（CST）

  const query = 'INSERT INTO teams (title, code, timestamp) VALUES (?, ?, ?)';
  db.query(query, [title, code, timestamp], (err, results) => {
    if (err) {
      console.error('Error inserting data:', err);
      return res.status(500).send('Internal Server Error');
    }
    res.send({ success: true, id: results.insertId });
  });
});

// 获取组队信息列表
app.get('/list', (req, res) => {
  db.query('SELECT * FROM teams ORDER BY id DESC', (err, results) => {
    if (err) {
      console.error('Error fetching data:', err);
      return res.status(500).send('Internal Server Error');
    }
    res.send(results); // 返回查询到的组队信息
  });
});

// 处理根路径请求，返回欢迎信息
app.get('/', (req, res) => {
  res.send('Welcome to the Team Sharing Application!');
});

// 启动服务器
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
