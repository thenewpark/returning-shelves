import { EASING, TIMING, SHELF_WIDTH } from './constants.js';
import { state } from './state.js';
import { delay, nextFrame } from './utils.js';
import {
  staticSpines, book3d, book3dInner, book3dSpineText,
  mainEl, headerEl, headerTitle, headerAuthor, headerYear,
  detailView, shelfPanel, contentPanel,
} from './dom.js';

// ── openBook phase helpers

function fadeOutOtherSpines(spine) {
  staticSpines.forEach(s => {
    if (s !== spine) s.classList.add('static-spine--hidden');
  });
}

function activateHeader(spine) {
  document.body.classList.add('book-active');
  headerTitle.textContent = spine.dataset.title || '';
  headerAuthor.textContent = spine.dataset.author || '';
  headerYear.textContent = spine.dataset.year || '';
  headerEl.classList.add('book-open');
}

async function animateSpineUpright(spine) {
  spine.style.transition = `transform 0.5s ${EASING},background-color 0.4s ease`;
  spine.style.transform = 'rotate(0deg)';
  spine.style.backgroundColor = '#D3D3D3';
  await delay(TIMING.SPINE_UPRIGHT);
}

async function animateSpineToCenter(spine) {
  const spineRect = spine.getBoundingClientRect();
  const mainRect = mainEl.getBoundingClientRect();
  const dx = mainRect.left + mainRect.width / 2 - (spineRect.left + spineRect.width / 2);

  spine.style.transition = `transform 0.4s ${EASING},opacity 0.3s ease`;
  spine.style.transform = `translateX(${dx}px) rotate(0deg)`;
  await delay(TIMING.SPINE_TO_CENTER);
  return { dx, mainRect };
}

async function animateSpineShrink(spine, dx, mainRect) {
  const verticalShift = book3d.getBoundingClientRect().bottom - mainRect.bottom + 10;

  spine.style.transition = `transform 0.4s ${EASING},height 0.4s ${EASING},opacity 0.3s ease`;
  spine.style.transform = `translateX(${dx}px) translateY(${verticalShift}px) rotate(0deg)`;
  spine.style.height = book3d.offsetHeight + 'px';
  await delay(TIMING.SPINE_SHRINK_TOTAL);
}

async function swapToBook3d(spine, mainRect) {
  book3dSpineText.textContent = spine.dataset.spineText || '';
  state.centerLeft = (mainRect.width - 48) / 2;
  book3d.style.left = state.centerLeft + 'px';
  spine.style.opacity = '0';
  book3d.classList.add('visible');
  state.stageNaturalCenter = book3d.getBoundingClientRect().left + book3d.offsetWidth / 2;
  book3dInner.style.transition = `transform 1.2s ${EASING}`;
  book3dInner.style.transform = 'rotateY(0deg)';
  await delay(TIMING.BOOK_OPEN_TOTAL);
}

export async function openBook(spine) {
  state.isAnimating = true;
  state.openSpine = spine;
  book3dSpineText.textContent = spine.dataset.spineText || '';

  fadeOutOtherSpines(spine);
  await delay(TIMING.OPEN_START_DELAY);

  activateHeader(spine);
  await animateSpineUpright(spine);

  const { dx, mainRect } = await animateSpineToCenter(spine);
  await animateSpineShrink(spine, dx, mainRect);
  await swapToBook3d(spine, mainRect);

  state.isAnimating = false;
  showDetailView();
}

// ── closeBook phase helpers

async function rotateBookToSpineView() {
  book3dInner.style.transition = `transform 1s ${EASING}`;
  book3dInner.style.transform = 'rotateY(90deg)';
  await delay(TIMING.CLOSE_ROTATE);
}

function swapToStaticSpine(spine) {
  book3d.classList.remove('visible');
  book3dInner.style.cssText = '';
  book3d.style.cssText = '';
  spine.style.opacity = '1';
}

async function restoreSpine(spine) {
  spine.style.transition =
    `transform 0.5s ${EASING},height 0.5s ${EASING},background-color 0.5s ease,opacity 0.3s ease`;
  spine.style.transform = '';
  spine.style.height = '';
  spine.style.backgroundColor = '';

  headerEl.classList.remove('book-open');
  document.body.classList.remove('book-active');

  await delay(TIMING.SPINE_RESTORE);

  staticSpines.forEach(s => {
    if (s !== spine) s.classList.remove('static-spine--hidden');
  });

  await delay(TIMING.SPINE_CLEANUP);

  spine.style.cssText = '';
}

export async function closeBook() {
  if (!state.openSpine) return;
  state.isAnimating = true;
  const spine = state.openSpine;
  state.openSpine = null;

  await rotateBookToSpineView();
  swapToStaticSpine(spine);
  await nextFrame();
  await restoreSpine(spine);

  state.isAnimating = false;
}

// ── Detail view transitions

export async function showDetailView() {
  state.isDetailView = true;

  book3d.style.zIndex = '100';
  book3d.style.transition = `transform 0.5s ${EASING}`;
  book3d.style.transform = `translateX(${SHELF_WIDTH / 2 - state.stageNaturalCenter}px)`;

  detailView.style.pointerEvents = 'auto';
  shelfPanel.style.transition = `transform 0.5s ${EASING}`;
  shelfPanel.style.transform = 'translateX(0)';

  await delay(TIMING.DETAIL_SLIDE);

  contentPanel.style.transition = 'opacity 0.4s ease';
  contentPanel.style.opacity = '1';
}

export async function hideDetailView() {
  state.isDetailView = false;
  state.isAnimating = true;

  contentPanel.style.transition = 'opacity 0.4s ease';
  contentPanel.style.opacity = '0';

  book3d.style.transition = `transform 0.5s ${EASING}`;
  book3d.style.transform = 'translateX(0)';
  book3d.style.zIndex = '2';

  await delay(TIMING.DETAIL_SLIDE);

  detailView.style.pointerEvents = 'none';
  shelfPanel.style.transition = `transform 0.5s ${EASING}`;
  shelfPanel.style.transform = 'translateX(-100%)';

  await delay(TIMING.DETAIL_SLIDE);

  closeBook();
}
