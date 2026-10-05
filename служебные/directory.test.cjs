const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');
const { readDirectory } = require('../directory');
const base = path.join(__dirname, 'проверки');

test('Чтение каталога, обновление, Unicode, пустой каталог и ошибки', async () => {
  await fs.mkdir(base, { recursive: true });
  const root = await fs.mkdtemp(path.join(base, 'directory-'));
  await fs.mkdir(path.join(root, 'Документы'));
  await fs.writeFile(path.join(root, 'заметка & пример.txt'), 'данные');
  const first = await readDirectory(root);
  assert.equal(first.ok, true);
  assert.deepEqual(first.entries.map(x => [x.name, x.isDir]), [
    ['Документы', true], ['заметка & пример.txt', false]
  ]);
  await fs.writeFile(path.join(root, 'новый.txt'), 'обновление');
  assert.equal((await readDirectory(root)).entries.length, 3);
  assert.deepEqual((await readDirectory(path.join(root, 'Документы'))).entries, []);
  assert.equal((await readDirectory(path.join(root, 'нет'))).ok, false);
  assert.equal((await readDirectory(path.join(root, 'новый.txt'))).ok, false);
});
