const fs = require('node:fs/promises');

async function readDirectory(root) {
  try {
    const items = await fs.readdir(root, { withFileTypes: true });
    const entries = items.map(item => ({
      name: item.name,
      isDir: item.isDirectory(),
      isLink: item.isSymbolicLink()
    })).sort((a, b) => Number(b.isDir) - Number(a.isDir) || a.name.localeCompare(b.name, 'ru'));
    return { ok: true, path: root, entries };
  } catch (error) {
    const messages = {
      ENOENT: 'Каталог больше не существует.',
      EACCES: 'Нет разрешения на чтение каталога.',
      EPERM: 'Операционная система запретила чтение каталога.',
      ENOTDIR: 'Указанный путь не является каталогом.'
    };
    return { ok: false, path: root, entries: [],
      error: messages[error.code] || 'Не удалось прочитать каталог.' };
  }
}
module.exports = { readDirectory };
