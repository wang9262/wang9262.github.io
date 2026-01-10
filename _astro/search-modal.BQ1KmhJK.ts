import Fuse from 'fuse.js';

type SearchItem = {
  title: string;
  description?: string;
  tags?: string[];
  body?: string;
  slug: string;
  date: string | Date;
};

let fuse: Fuse<SearchItem> | null = null;
let initialized = false;
let searchPopup: HTMLElement | null = null;
let searchContainer: HTMLElement | null = null;
let searchInput: HTMLInputElement | null = null;
let searchResults: HTMLElement | null = null;
let closeBtn: HTMLElement | null = null;
let overlay: HTMLElement | null = null;
let inputDebounceTimer: number | null = null;

async function initSearch() {
  if (fuse) return;
  try {
    const res = await fetch('/search.json');
    if (!res.ok) throw new Error(`search index request failed: ${res.status}`);
    const data = (await res.json()) as SearchItem[];
    fuse = new Fuse(data, {
      keys: ['title', 'description', 'tags', 'body'],
      includeScore: true,
      threshold: 0.1,
      ignoreLocation: true,
    });
  } catch {
    renderMessage('搜索初始化失败', '请刷新页面或稍后重试');
    fuse = null;
  }
}

function clearResults() {
  if (!searchResults) return;
  searchResults.replaceChildren();
}

function renderMessage(title: string, subtitle?: string) {
  if (!searchResults) return;
  const wrapper = document.createElement('div');
  wrapper.className = 'flex flex-col items-center justify-center py-12 text-text-muted';

  const titleEl = document.createElement('p');
  titleEl.className = 'font-medium';
  titleEl.textContent = title;
  wrapper.appendChild(titleEl);

  if (subtitle) {
    const subtitleEl = document.createElement('p');
    subtitleEl.className = 'mt-2 text-sm';
    subtitleEl.textContent = subtitle;
    wrapper.appendChild(subtitleEl);
  }

  searchResults.replaceChildren(wrapper);
}

function renderEmptyHint() {
  if (!searchResults) return;
  const wrapper = document.createElement('div');
  wrapper.className = 'flex flex-col items-center justify-center py-12 text-text-muted';

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('fill', 'none');
  svg.setAttribute('stroke', 'currentColor');
  svg.setAttribute('stroke-width', '2');
  svg.classList.add('mb-4', 'opacity-20');
  svg.style.width = '48px';
  svg.style.height = '48px';

  const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
  circle.setAttribute('cx', '11');
  circle.setAttribute('cy', '11');
  circle.setAttribute('r', '7');
  svg.appendChild(circle);

  const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
  line.setAttribute('x1', '21');
  line.setAttribute('y1', '21');
  line.setAttribute('x2', '16.65');
  line.setAttribute('y2', '16.65');
  svg.appendChild(line);

  const text = document.createElement('p');
  text.textContent = '输入关键词开始搜索';

  wrapper.appendChild(svg);
  wrapper.appendChild(text);
  searchResults.replaceChildren(wrapper);
}

function openSearch() {
  document.body.style.overflow = 'hidden';
  searchPopup?.classList.remove('hidden');
  setTimeout(() => {
    searchContainer?.classList.remove('scale-95', 'opacity-0');
    searchContainer?.classList.add('scale-100', 'opacity-100');
    searchInput?.focus();
  }, 10);
  void initSearch();
}

function closeSearch() {
  document.body.style.overflow = '';
  searchContainer?.classList.remove('scale-100', 'opacity-100');
  searchContainer?.classList.add('scale-95', 'opacity-0');
  setTimeout(() => {
    searchPopup?.classList.add('hidden');
    if (searchInput) searchInput.value = '';
    renderEmptyHint();
  }, 200);
}

function getSnippet(text: string | undefined, query: string) {
  if (!text) return '';
  if (!query) return text.substring(0, 150);
  const lowerText = text.toLowerCase();
  const lowerQuery = query.toLowerCase();
  const index = lowerText.indexOf(lowerQuery);
  if (index === -1) return text.substring(0, 150);
  const start = Math.max(0, index - 20);
  const end = Math.min(text.length, index + 100);
  let snippet = text.substring(start, end);
  if (start > 0) snippet = '...' + snippet;
  if (end < text.length) snippet += '...';
  return snippet;
}

function appendHighlightedText(target: HTMLElement, text: string, query: string) {
  if (!query) {
    target.appendChild(document.createTextNode(text));
    return;
  }
  const lowerText = text.toLowerCase();
  const lowerQuery = query.toLowerCase();
  let currentIndex = 0;
  while (currentIndex < text.length) {
    const matchIndex = lowerText.indexOf(lowerQuery, currentIndex);
    if (matchIndex === -1) {
      target.appendChild(document.createTextNode(text.slice(currentIndex)));
      return;
    }
    if (matchIndex > currentIndex) {
      target.appendChild(document.createTextNode(text.slice(currentIndex, matchIndex)));
    }
    const highlight = document.createElement('span');
    highlight.className = 'text-primary font-bold border-b border-primary/30';
    highlight.textContent = text.slice(matchIndex, matchIndex + lowerQuery.length);
    target.appendChild(highlight);
    currentIndex = matchIndex + lowerQuery.length;
  }
}

function createResultList(results: Array<{ item: SearchItem }>, query: string) {
  const ul = document.createElement('ul');
  ul.className = 'space-y-2';

  for (const { item } of results.slice(0, 10)) {
    const li = document.createElement('li');

    const a = document.createElement('a');
    a.href = `/posts/${item.slug}/`;
    a.className =
      'block p-4 rounded-lg hover:bg-bg-surface-hover group transition-colors border border-transparent hover:border-border';

    const header = document.createElement('div');
    header.className = 'flex justify-between items-start';

    const h3 = document.createElement('h3');
    h3.className = 'text-base font-bold text-text-main group-hover:text-primary';
    appendHighlightedText(h3, item.title, query);

    const date = document.createElement('span');
    date.className = 'text-xs text-text-muted font-mono whitespace-nowrap ml-2';
    date.textContent = new Date(item.date).toLocaleDateString();

    header.appendChild(h3);
    header.appendChild(date);

    const p = document.createElement('p');
    p.className = 'text-sm text-text-muted mt-1 line-clamp-2';
    const snippet = getSnippet(item.description || item.body, query);
    appendHighlightedText(p, snippet, query);

    a.appendChild(header);
    a.appendChild(p);
    li.appendChild(a);
    ul.appendChild(li);
  }

  return ul;
}

async function init() {
  if (initialized) return;
  searchPopup = document.getElementById('search-popup');
  searchContainer = document.getElementById('search-container');
  searchInput = document.getElementById('search-input') as HTMLInputElement | null;
  searchResults = document.getElementById('search-results');
  closeBtn = document.getElementById('close-search');
  overlay = document.getElementById('search-overlay');

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !searchPopup?.classList.contains('hidden')) closeSearch();
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      openSearch();
    }
  });

  closeBtn?.addEventListener('click', closeSearch);
  overlay?.addEventListener('click', closeSearch);

  searchInput?.addEventListener('input', (e) => {
    const query = (e.target as HTMLInputElement).value;
    if (inputDebounceTimer) window.clearTimeout(inputDebounceTimer);
    inputDebounceTimer = window.setTimeout(() => {
      if (!query.trim()) {
        renderEmptyHint();
        return;
      }
      if (!fuse) {
        renderMessage('搜索尚未就绪', '请稍候片刻再试');
        return;
      }
      const results = fuse.search(query);
      if (!searchResults) return;
      if (results.length === 0) {
        renderMessage('未找到相关内容', '换个词试试？');
        return;
      }
      const ul = createResultList(results, query);
      searchResults.replaceChildren(ul);
    }, 120);
  });

  initialized = true;
}

export default async function openSearchModal() {
  await init();
  openSearch();
}
