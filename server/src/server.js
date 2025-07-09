const https = require('https');
const fs = require('fs');

// Для продакшена (раскомментируйте и укажите пути к сертификатам)
/*
const options = {
  key: fs.readFileSync('path/to/key.pem'),
  cert: fs.readFileSync('path/to/cert.pem')
};
https.createServer(options, app).listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
});
*/