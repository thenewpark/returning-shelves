import { state } from './state.js';
import {
  book3d, booksBackdrop, bookLocationPanel, connectorLine,
  connectorSvg, spineCircle, designerScroll, spreadsArrow,
} from './dom.js';

export function selectBook(bookEl) {
  if (state.selectedBook) deselectBook();
  state.selectedBook = bookEl;
  const infoCard = bookEl.querySelector('.info-card');

  bookEl.classList.add('related-book--selected');
  booksBackdrop.classList.add('visible');
  bookLocationPanel.classList.add('visible');
  if (infoCard) infoCard.classList.add('visible');
  designerScroll.classList.add('designer-scroll--locked');
  spreadsArrow.classList.add('spreads-arrow--hidden');
  book3d.classList.add('faded');
  requestAnimationFrame(updateConnector);
}

export function deselectBook() {
  if (!state.selectedBook) return;
  const infoCard = state.selectedBook.querySelector('.info-card');

  if (infoCard) infoCard.classList.remove('visible');
  state.selectedBook.classList.remove('related-book--selected');
  state.selectedBook = null;
  booksBackdrop.classList.remove('visible');
  bookLocationPanel.classList.remove('visible');
  if (connectorLine) connectorLine.setAttribute('opacity', '0');
  designerScroll.classList.remove('designer-scroll--locked');
  spreadsArrow.classList.remove('spreads-arrow--hidden');
  book3d.classList.remove('faded');
}

export function updateConnector() {
  if (!state.selectedBook || !spineCircle || !connectorLine) return;
  const infoCard = state.selectedBook.querySelector('.info-card');
  if (!infoCard) return;
  const svgRect = connectorSvg.getBoundingClientRect();
  const circleRect = spineCircle.getBoundingClientRect();
  const cardRect = infoCard.getBoundingClientRect();
  // bottom-right corner of the spine-circle
  const x1 = circleRect.right - svgRect.left - 4;
  const y1 = circleRect.bottom - svgRect.top - 4;
  // top-center of the info-card before CSS rotate(14deg) is applied
  // top-center: (0, -h/2) in local coords → clockwise 14°: x'= (h/2)·sinθ, y'= -(h/2)·cosθ
  const angle = 14 * Math.PI / 180;
  const cardH = infoCard.offsetHeight;
  const cardCenterX = cardRect.left + cardRect.width / 2 - svgRect.left;
  const cardCenterY = cardRect.top + cardRect.height / 2 - svgRect.top;
  const x2 = cardCenterX - (cardH / 2) * Math.sin(angle);
  const y2 = cardCenterY - (cardH / 2) * Math.cos(angle);

  connectorLine.setAttribute('x1', x1);
  connectorLine.setAttribute('y1', y1);
  connectorLine.setAttribute('x2', x2);
  connectorLine.setAttribute('y2', y2);
  connectorLine.setAttribute('opacity', '1');
}
