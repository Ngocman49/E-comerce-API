const app = require('./src/app');

const PORT = process.env.PORT || 3002;
const server = app.listen(PORT, () => {
  console.log(`Server is start with port: ${PORT}`);
});

process.on('SIGINT', () => {
  server.close(() => {
    console.log(`Exit Server`);
    // notify.send(ping ...)
  });
});
