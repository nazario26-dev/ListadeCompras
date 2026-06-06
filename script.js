const itemForm = document.getElementById('item-form');
const itemInput = document.getElementById('item-input');
const itemList = document.getElementById('item-list');
const statusText = document.getElementById('status-text');
const clearBtn = document.getElementById('clear-btn');

const STORAGE_KEY = 'listaDeComprasItens';

let items = [];

function saveItems() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch (error) {
    console.warn('Não foi possível salvar a lista:', error);
  }
}

function loadItems() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) {
      items = [];
      return;
    }

    const parsed = JSON.parse(saved);
    items = Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.warn('Não foi possível carregar a lista salva:', error);
    items = [];
  }
}

function updateStatus() {
  if (items.length === 0) {
    statusText.textContent = 'Nenhum item adicionado ainda.';
    return;
  }

  const completed = items.filter(item => item.checked).length;
  const connectionLabel = navigator.onLine ? 'Conectado' : 'Offline';
  statusText.textContent = `${completed} de ${items.length} item(s) marcado(s). • ${connectionLabel}`;
}

function renderList() {
  itemList.innerHTML = '';

  if (items.length === 0) {
    updateStatus();
    return;
  }

  items.forEach((item, index) => {
    const listItem = document.createElement('li');

    const label = document.createElement('label');
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = item.checked;
    checkbox.addEventListener('change', () => {
      items[index].checked = checkbox.checked;
      saveItems();
      renderList();
    });

    const text = document.createElement('span');
    text.textContent = item.name;
    if (item.checked) {
      text.classList.add('completed');
    }

    label.appendChild(checkbox);
    label.appendChild(text);

    const deleteButton = document.createElement('button');
    deleteButton.type = 'button';
    deleteButton.className = 'delete-btn';
    deleteButton.textContent = 'Remover';
    deleteButton.addEventListener('click', () => {
      items.splice(index, 1);
      saveItems();
      renderList();
    });

    listItem.appendChild(label);
    listItem.appendChild(deleteButton);
    itemList.appendChild(listItem);
  });

  updateStatus();
}

itemForm.addEventListener('submit', event => {
  event.preventDefault();
  const value = itemInput.value.trim();
  if (!value) {
    itemInput.focus();
    return;
  }

  items.unshift({ name: value, checked: false });
  itemInput.value = '';
  saveItems();
  renderList();
  itemInput.focus();
});

clearBtn.addEventListener('click', () => {
  if (items.length === 0) return;
  items = [];
  saveItems();
  renderList();
});

loadItems();
renderList();
updateStatus();

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(error => {
      console.warn('Falha ao registrar o service worker:', error);
    });
  });
}

window.addEventListener('online', updateStatus);
window.addEventListener('offline', updateStatus);
