import { state } from './state.js';
import { tabs, designerTrack } from './dom.js';
import { selectBook, deselectBook } from './books.js';
import { openBook, closeBook, hideDetailView } from './animation.js';
import { selectTab } from './tabs.js';

const defaultTab = document.querySelector('.tab--designer');
if (defaultTab) selectTab(defaultTab);

designerTrack.addEventListener('click', function (e) {
  e.stopPropagation();
  if (state.isAnimating) return;
  const bookEl = e.target.closest('.related-book[data-cover="assemblies"]');
  if (!bookEl) return;

  if (state.selectedBook === bookEl) deselectBook();
  else selectBook(bookEl);
});

tabs.forEach(tab => {
  tab.addEventListener('click', function (e) {
    e.stopPropagation();
    if (state.isAnimating) return;
    selectTab(tab);
  });
});

document.addEventListener('click', function (e) {
  if (state.isAnimating) return;

  if (state.isDetailView) {
    if (state.selectedBook) deselectBook();
    return;
  }

  const clickedSpine = e.target.closest('.static-spine');
  if (clickedSpine && !state.openSpine) openBook(clickedSpine);
  else if (!clickedSpine && state.openSpine) closeBook();
});
