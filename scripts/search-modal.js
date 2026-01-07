let fuse;
let initialized = false;
let searchPopup;
let searchContainer;
let searchInput;
let searchResults;
let closeBtn;
let overlay;

async function initSearch() {
  if (fuse) return;
  try {
    const res = await fetch('/search.json');
    const data = await res.json();
    const Fuse = (await import('https://cdn.jsdelivr.net/npm/fuse.js@7.1.0/+esm')).default;
    fuse = new Fuse(data, {
      keys: ['title', 'description', 'tags', 'body'],
      includeScore: true,
      threshold: 0.1,
      ignoreLocation: true,
    });
  } catch {}
}

function openSearch() {
  document.body.style.overflow = 'hidden';
  searchPopup && searchPopup.classList.remove('hidden');
  setTimeout(() => {
    searchContainer && searchContainer.classList.remove('scale-95', 'opacity-0');
    searchContainer && searchContainer.classList.add('scale-100', 'opacity-100');
    searchInput && searchInput.focus();
  }, 10);
  initSearch();
}

function closeSearch() {
  document.body.style.overflow = '';
  searchContainer && searchContainer.classList.remove('scale-100', 'opacity-100');
  searchContainer && searchContainer.classList.add('scale-95', 'opacity-0');
  setTimeout(() => {
    searchPopup && searchPopup.classList.add('hidden');
    if (searchInput) searchInput.value = '';
    if (searchResults) searchResults.innerHTML = `
      <div class="flex flex-col items-center justify-center py-12 text-gray-400">
        <i class="fa-solid fa-magnifying-glass fa-3x mb-4 opacity-20"></i>
        <p>输入关键词开始搜索</p>
      </div>
    `;
  }, 200);
}

function getSnippet(text, query) {
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

function highlightText(text, query) {
  if (!query) return text;
  const escapedQuery = query.replace(/[.*+?^${}()|[\\]\\]/g, '\\$&');
  const regex = new RegExp(`(${escapedQuery})`, 'gi');
  return text.replace(regex, '<span class="text-primary font-bold border-b border-primary/30">$1</span>');
}

async function init() {
  if (initialized) return;
  searchPopup = document.getElementById('search-popup');
  searchContainer = document.getElementById('search-container');
  searchInput = document.getElementById('search-input');
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

  closeBtn && closeBtn.addEventListener('click', closeSearch);
  overlay && overlay.addEventListener('click', closeSearch);

  searchInput && searchInput.addEventListener('input', (e) => {
    if (!fuse) return;
    const query = e.target.value;
    if (!query.trim()) {
      searchResults.innerHTML = `
        <div class="flex flex-col items-center justify-center py-12 text-text-muted">
          <i class="fa-solid fa-magnifying-glass fa-3x mb-4 opacity-20"></i>
          <p>输入关键词开始搜索</p>
        </div>
      `;
      return;
    }
    const results = fuse.search(query);
    if (results.length === 0) {
      searchResults.innerHTML = `
        <div class="flex flex-col items-center justify-center py-12 text-text-muted">
          <i class="fa-regular fa-folder-open fa-3x mb-4 opacity-20"></i>
          <p>未找到相关内容，换个词试试？</p>
        </div>
      `;
    } else {
      searchResults.innerHTML = `
        <ul class="space-y-2">
          ${results.slice(0, 10).map(({ item }) => {
            const snippet = getSnippet(item.description || item.body, query);
            return `
            <li>
              <a href="/posts/${item.slug}/" class="block p-4 rounded-lg hover:bg-bg-surface-hover group transition-colors border border-transparent hover:border-border">
                <div class="flex justify-between items-start">
                  <h3 class="text-base font-bold text-text-main group-hover:text-primary">
                    ${highlightText(item.title, query)}
                  </h3>
                  <span class="text-xs text-text-muted font-mono whitespace-nowrap ml-2">
                    ${new Date(item.date).toLocaleDateString()}
                  </span>
                </div>
                <p class="text-sm text-text-muted mt-1 line-clamp-2">
                  ${highlightText(snippet, query)}
                </p>
              </a>
            </li>
          `}).join('')}
        </ul>
      `;
    }
  });

  initialized = true;
}

export default async function openSearchModal() {
  await init();
  openSearch();
}
