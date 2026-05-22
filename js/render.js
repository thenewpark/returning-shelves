import { TAB_BOOKS } from './constants.js';
import { designerTrack } from './dom.js';

export function bookToHTML(book) {
  const infoCard = book.cover === 'assemblies'
    ? `<div class="info-card" id="assemblies-info-card"><p class="info-card-text">Studies on Assemblies</p></div>`
    : '';

  return `<div class="related-book" data-cover="${book.cover}">
    <div class="related-label">${book.label}</div>
    <div class="related-cover related-cover--${book.cover}"></div>
    ${infoCard}
  </div>`;
}

export function renderBooks(tabType) {
  designerTrack.innerHTML = (TAB_BOOKS[tabType] || []).map(bookToHTML).join('');
}
