const { Command } = require('commander');
const program = new Command();

// Описуємо аргументи командного рядка
program
  .requiredOption('-h, --host <host>', 'адреса сервера')
  .requiredOption('-p, --port <port>', 'порт сервера')
  .requiredOption('-c, --cache <path>', 'шлях до директорії кешу')
  .parse(process.argv);

// Отримаємо параметри
const options = program.opts();
console.log('Параметри командного рядка:', options);