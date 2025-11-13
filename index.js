const { Command } = require('commander');
const fs = require('fs').promises;
const fsSync = require('fs'); // для синхронної перевірки існування папки
const path = require('path');
const http = require('http');

// --- Commander.js для аргументів командного рядка ---
const program = new Command();
program
  .requiredOption('-h, --host <host>', 'Server host') // велика літера
  .requiredOption('-p, --port <port>', 'Server port')
  .requiredOption('-c, --cache <path>', 'Cache directory path');


program.parse(process.argv);
const options = program.opts();
const { host, port, cache } = options;

// --- Створюємо директорію кешу, якщо її нема ---
if (!fsSync.existsSync(cache)) {
  fsSync.mkdirSync(cache, { recursive: true });
  console.log(`📁 Created cache directory: ${cache}`);
}

// --- Функція для шляху до файлу кешу ---
function getCacheFilePath(cacheDir, code) {
  return path.join(cacheDir, `${code}.jpg`);
}

// --- HTTP сервер ---
const server = http.createServer(async (req, res) => {
  const code = req.url.slice(1); // наприклад /200 -> 200
  const filePath = getCacheFilePath(cache, code);

  try {
    if (req.method === 'GET') {
      // GET: отримати картинку
      const data = await fs.readFile(filePath);
      res.writeHead(200, { 'Content-Type': 'image/jpeg' });
      res.end(data);

    } else if (req.method === 'PUT') {
      // PUT: записати картинку
      const chunks = [];
      req.on('data', chunk => chunks.push(chunk));
      req.on('end', async () => {
        const buffer = Buffer.concat(chunks);
        await fs.writeFile(filePath, buffer);
        res.writeHead(201); // Created
        res.end('Created');
      });

    } else if (req.method === 'DELETE') {
      // DELETE: видалити картинку
      await fs.unlink(filePath);
      res.writeHead(200);
      res.end('Deleted');

    } else {
      // будь-який інший метод
      res.writeHead(405); // Method Not Allowed
      res.end('Method Not Allowed');
    }

  } catch (err) {
    if (err.code === 'ENOENT') {
      res.writeHead(404); // Not Found
      res.end('Not Found');
    } else {
      console.error(err);
      res.writeHead(500);
      res.end('Internal Server Error');
    }
  }
});

// --- Запуск сервера ---
server.listen(port, host, () => {
  console.log(`🚀 Server running at http://${host}:${port}`);
});

