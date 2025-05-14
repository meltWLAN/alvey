const express = require('express');
const path = require('path');
const app = express();
const port = 3000;

// 提供静态文件
app.use(express.static(path.join(__dirname)));

// 主页路由
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// 启动服务器
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
}); 