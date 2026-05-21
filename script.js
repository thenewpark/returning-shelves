const staticSpines = Array.from(document.querySelectorAll('.static-spine'));
const book3d = document.getElementById('book3d');
const book3dInner = book3d.querySelector('.book');
const book3dSpineText = book3d.querySelector('.spine-text');

const mainEl = document.querySelector('main');
const headerEl = document.querySelector('header');
const headerTitle = document.querySelector('.header-title');
const headerAuthor = document.querySelector('.header-author');
const headerYear = document.querySelector('.header-year');
const detailView = document.getElementById('detail-view');
const shelfPanel = document.getElementById('shelf-panel');
const contentPanel = document.getElementById('content-panel');

// ── Tab 전환 관련
const tabs = Array.from(document.querySelectorAll('.tab'));
const subTabBar = document.querySelector('.sub-tab-bar');
const subTabName = document.querySelector('.sub-tab-name');
const subTabDesc = document.querySelector('.sub-tab-desc');

const TAB_DATA = {
  designer: {
    modifier: 'sub-tab-bar--designer',
    name: 'Omnigroup',
    desc: 'Omnigroup is a collaborative graphic design studio based in Lausanne, Switzerland, founded by Leonardo Azzolini and Simon Mager. Others books from this studio are:'
  },
  returned: {
    modifier: 'sub-tab-bar--returned',
    name: 'Returned with',
    desc: 'A collection of books that were returned alongside the one you selected.'
  },
  materiality: {
    modifier: 'sub-tab-bar--materiality',
    name: 'Materiality',
    desc: 'Books with similar physical properties:\nPaperback, 24 × 16 × 2.3 cm, 220 pages'
  }
};

// 탭별 관련 책 목록
const TAB_BOOKS = {
  designer: [
    { label: '《Studies on Assemblies》', cover: 'assemblies' },
    { label: '《Down Under》', cover: 'downunder' },
    { label: '《Schriften / Lettering / Écritures》', cover: 'schriften' },
  ],
  returned: [
    { label: '《The Life of Things》+《Décadrages》', cover: 'stack01' },
    { label: '《Klima》+《Michel Air Peace》+《S,M,L,XL》', cover: 'stack02' },
    { label: '《The Publisher\'s Issue》+《Ways of Seeing》', cover: 'stack03' },
  ],
  materiality: [
    { label: '《Ways of Seeing》', cover: 'ways-of-seeing' },
    { label: '《New Dark Age》', cover: 'new-dark-age' },
    { label: '《Caractères》', cover: 'caracteres' }
  ]
};

const designerTrack = document.querySelector('.designer-track');
const designerScroll = document.querySelector('.designer-scroll');
const spreadsArrow = document.querySelector('.spreads-arrow');
const bookLocationPanel = document.getElementById('book-location-panel');
const booksBackdrop = document.getElementById('books-backdrop');
const connectorSvg = document.getElementById('connector-svg');
const connectorLine = document.getElementById('connector-line');
const spineCircle = document.getElementById('spine-circle');

// ── 애니메이션 상수
const EASING = 'cubic-bezier(0.4, 0, 0.2, 1)';
const TIMING = {
  OPEN_START_DELAY:   300,   // 다른 spine 페이드아웃 후 대기
  SPINE_UPRIGHT:      500,   // spine 직립
  SPINE_TO_CENTER:    400,   // spine 중앙 이동
  SPINE_SHRINK_TOTAL: 600,   // spine 축소(400ms) + 정지(200ms)
  BOOK_OPEN_TOTAL:   1350,   // 커버 회전(1200ms) + 정착(150ms)
  DETAIL_SLIDE:       500,   // detail view 슬라이드 인/아웃
  CLOSE_ROTATE:      1000,   // 커버 회전(닫기)
  SPINE_RESTORE:      500,   // spine 원위치 복귀
  SPINE_CLEANUP:      300,   // cssText 초기화 대기
};
const SHELF_WIDTH = 359;

// ── 앱 상태
const state = {
  selectedBook: null,
  openSpine: null,
  isAnimating: false,
  isDetailView: false,
  centerLeft: 0,
  stageNaturalCenter: 0,
};

// ── 비동기 헬퍼
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
const nextFrame = () => new Promise(resolve => requestAnimationFrame(resolve));

// ── 책 목록 렌더링

function bookToHTML(book) {
  const infoCard = book.cover === 'assemblies'
    ? `<div class="info-card" id="assemblies-info-card"><p class="info-card-text">Studies on Assemblies</p></div>`
    : '';
  return `<div class="related-book" data-cover="${book.cover}">
    <div class="related-label">${book.label}</div>
    <div class="related-cover related-cover--${book.cover}"></div>
    ${infoCard}
  </div>`;
}

function renderBooks(tabType) {
  designerTrack.innerHTML = (TAB_BOOKS[tabType] || []).map(bookToHTML).join('');
}

// ── 관련 책 선택

function selectBook(bookEl) {
  if (state.selectedBook) deselectBook();
  state.selectedBook = bookEl;
  bookEl.classList.add('related-book--selected');
  booksBackdrop.classList.add('visible');
  bookLocationPanel.classList.add('visible');
  const infoCard = bookEl.querySelector('.info-card');
  if (infoCard) infoCard.classList.add('visible');
  designerScroll.classList.add('designer-scroll--locked');
  spreadsArrow.classList.add('spreads-arrow--hidden');
  book3d.classList.add('faded');
  requestAnimationFrame(updateConnector);
}

function deselectBook() {
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

function updateConnector() {
  if (!state.selectedBook || !spineCircle || !connectorLine) return;
  const infoCard = state.selectedBook.querySelector('.info-card');
  if (!infoCard) return;
  const svgRect = connectorSvg.getBoundingClientRect();
  const circleRect = spineCircle.getBoundingClientRect();
  const cardRect = infoCard.getBoundingClientRect();
  // spine-circle 우측 하단 모서리
  const x1 = circleRect.right - svgRect.left - 4;
  const y1 = circleRect.bottom - svgRect.top - 4;
  // info-card 회전 전 상단 중앙점 → CSS rotate(14deg) 적용
  // 상단 중앙: (0, -h/2) 상대좌표 → 시계방향 14°: x'= (h/2)·sinθ, y'= -(h/2)·cosθ
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

// ── openBook 단계별 함수

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

async function openBook(spine) {
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

// ── closeBook 단계별 함수

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

async function closeBook() {
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

// ── Detail view 전환

async function showDetailView() {
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

async function hideDetailView() {
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

// ── Tab 전환 핸들러

function selectTab(tab) {
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

// ── 초기화 및 이벤트 바인딩

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
    if (state.selectedBook) {
      deselectBook();
      return;
    }
    hideDetailView();
    return;
  }

  const clickedSpine = e.target.closest('.static-spine');
  if (clickedSpine && !state.openSpine) openBook(clickedSpine);
  else if (!clickedSpine && state.openSpine) closeBook();
});
