import { TAB_DATA } from './constants.js';
import { tabs, subTabBar, subTabName, subTabDesc } from './dom.js';
import { deselectBook } from './books.js';
import { renderBooks } from './render.js';

export function selectTab(tab) {
  const tabType = tab.dataset.tab;
  if (!tabType) return;

  deselectBook();

  tabs.forEach(t => t.classList.remove('tab--selected'));
  tab.classList.add('tab--selected');

  const data = TAB_DATA[tabType];

  subTabBar.classList.remove(
    'sub-tab-bar--designer',
    'sub-tab-bar--returned',
    'sub-tab-bar--materiality'
  );
  subTabBar.classList.add(data.modifier);
  subTabName.textContent = data.name;
  subTabDesc.textContent = data.desc;

  renderBooks(tabType);
}
