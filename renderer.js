const button = document.querySelector('#show-directory');
const list = document.querySelector('#entries');
const status = document.querySelector('#status');
const directory = document.querySelector('#directory');
let requestNumber = 0;

async function refreshDirectory() {
  const current = ++requestNumber;
  button.disabled = true;
  status.textContent = 'Чтение каталога…';
  status.dataset.state = 'loading';
  try {
    const result = await window.api.listDir('.');
    if (current !== requestNumber) return;
    directory.textContent = result.path;
    list.replaceChildren();
    if (!result.ok) {
      status.textContent = result.error;
      status.dataset.state = 'error';
      return;
    }
    for (const entry of result.entries) {
      const item = document.createElement('li');
      item.className = entry.isDir ? 'entry folder' : 'entry';
      const symbol = document.createElement('span');
      symbol.className = 'symbol';
      symbol.textContent = entry.isDir ? '▣' : '▤';
      symbol.setAttribute('aria-hidden', 'true');
      const name = document.createElement('span');
      name.className = 'name';
      name.textContent = entry.name; // File names are text, never HTML.
      const kind = document.createElement('span');
      kind.className = 'kind';
      kind.textContent = entry.isLink ? 'Ссылка' : entry.isDir ? 'Каталог' : 'Файл';
      item.append(symbol, name, kind);
      list.append(item);
    }
    const folders = result.entries.filter(entry => entry.isDir).length;
    status.textContent = result.entries.length === 0
      ? 'Каталог пуст.'
      : `Всего: ${result.entries.length} · Каталогов: ${folders} · Файлов и ссылок: ${result.entries.length - folders}`;
    status.dataset.state = 'ready';
  } catch {
    if (current !== requestNumber) return;
    list.replaceChildren();
    status.textContent = 'Не удалось получить список. Повторите обновление.';
    status.dataset.state = 'error';
  } finally {
    if (current === requestNumber) button.disabled = false;
  }
}
button.addEventListener('click', refreshDirectory);
const unsubscribe = window.api.onRefresh(refreshDirectory);
window.addEventListener('beforeunload', unsubscribe, { once: true });
