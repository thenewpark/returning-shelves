(function () {
  var staticSpines = [].slice.call(document.querySelectorAll('.static-spine'));
  var book3d = document.getElementById('book3d');
  var book3dInner = book3d.querySelector('.book');
  var book3dSpineText = book3d.querySelector('.spine-text');

  var mainEl = document.querySelector('main');
  var headerEl = document.querySelector('header');
  var headerTitle = document.querySelector('.header-title');
  var headerAuthor = document.querySelector('.header-author');
  var headerYear = document.querySelector('.header-year');
  var detailView = document.getElementById('detail-view');
  var shelfPanel = document.getElementById('shelf-panel');
  var contentPanel = document.getElementById('content-panel');

  // ── Tab 전환 관련
  var tabs = [].slice.call(document.querySelectorAll('.tab'));
  var subTabBar = document.querySelector('.sub-tab-bar');
  var subTabName = document.querySelector('.sub-tab-name');
  var subTabDesc = document.querySelector('.sub-tab-desc');

  var TAB_DATA = {
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
  var TAB_BOOKS = {
    designer: [
      { label: '《Studies on Assemblies》', cover: 'assemblies' },
      { label: '《Down Under》', cover: 'downunder' },
      { label: '《Schriften / Lettering / Écritures》', cover: 'schriften' },
    ],
    returned: [
      { label: '《The Life of Things》+《Décadrages》', cover: 'stack01' },
      { label: '《Klima》+《Michel Air Peace》+《S,M,L,XL》', cover: 'stack02' },
      { label: '《The Publisher’s Issue》+《Ways of Seeing》', cover: 'stack03' },
    ],
    materiality: [
      { label: '《Ways of Seeing》', cover: 'ways-of-seeing' },
      { label: '《New Dark Age》', cover: 'new-dark-age' },
      { label: '《Caractères》', cover: 'caracteres' }
    ]
  };

  var designerTrack = document.querySelector('.designer-track');
  var designerScroll = document.querySelector('.designer-scroll');
  var spreadsArrow = document.querySelector('.spreads-arrow');
  var bookLocationPanel = document.getElementById('book-location-panel');
  var booksBackdrop = document.getElementById('books-backdrop');
  var connectorSvg = document.getElementById('connector-svg');
  var connectorLine = document.getElementById('connector-line');
  var spineCircle = document.getElementById('spine-circle');
  var selectedBook = null;

  function renderBooks(tabType) {
    var books = TAB_BOOKS[tabType] || [];
    var html = books.map(function (book) {
      var infoCard = book.cover === 'assemblies'
        ? '<div class="info-card" id="assemblies-info-card">' +
        '<p class="info-card-text">Studies on Assemblies</p>' +
        '</div>'
        : '';
      return (
        '<div class="related-book" data-cover="' + book.cover + '">' +
        '<div class="related-label">' + book.label + '</div>' +
        '<div class="related-cover related-cover--' + book.cover + '"></div>' +
        infoCard +
        '</div>'
      );
    }).join('');
    designerTrack.innerHTML = html;
    bindBookClicks();
  }

  function bindBookClicks() {
    var books = [].slice.call(designerTrack.querySelectorAll('.related-book[data-cover="assemblies"]'));
    books.forEach(function (bookEl) {
      bookEl.addEventListener('click', function (e) {
        e.stopPropagation();
        if (isAnimating) return;
        if (selectedBook === bookEl) {
          deselectBook();
        } else {
          selectBook(bookEl);
        }
      });
    });
  }

  function selectBook(bookEl) {
    if (selectedBook) deselectBook();
    selectedBook = bookEl;
    bookEl.classList.add('related-book--selected');
    booksBackdrop.classList.add('visible');
    bookLocationPanel.classList.add('visible');
    var infoCard = bookEl.querySelector('.info-card');
    if (infoCard) infoCard.classList.add('visible');
    designerScroll.style.overflowX = 'hidden';
    spreadsArrow.style.zIndex = '1';
    book3d.style.transition = 'opacity 0.3s ease';
    book3d.style.opacity = '0';
    book3d.style.pointerEvents = 'none';
    requestAnimationFrame(updateConnector);
  }

  function deselectBook() {
    if (!selectedBook) return;
    var infoCard = selectedBook.querySelector('.info-card');
    if (infoCard) infoCard.classList.remove('visible');
    selectedBook.classList.remove('related-book--selected');
    selectedBook = null;
    booksBackdrop.classList.remove('visible');
    bookLocationPanel.classList.remove('visible');
    if (connectorLine) connectorLine.setAttribute('opacity', '0');
    designerScroll.style.overflowX = 'auto';
    spreadsArrow.style.zIndex = '';
    book3d.style.transition = 'opacity 0.3s ease';
    book3d.style.opacity = '1';
    book3d.style.pointerEvents = 'auto';
  }

  function updateConnector() {
    if (!selectedBook || !spineCircle || !connectorLine) return;
    var infoCard = selectedBook.querySelector('.info-card');
    if (!infoCard) return;
    var svgRect = connectorSvg.getBoundingClientRect();
    var circleRect = spineCircle.getBoundingClientRect();
    var cardRect = infoCard.getBoundingClientRect();
    // spine-circle 우측 하단 모서리
    var x1 = circleRect.right - svgRect.left - 4;
    var y1 = circleRect.bottom - svgRect.top - 4;
    // info-card 회전 전 상단 중앙점 → CSS rotate(14deg) 적용
    // 상단 중앙: (0, -h/2) 상대좌표 → 시계방향 14°: x'= (h/2)·sinθ, y'= -(h/2)·cosθ
    var angle = 14 * Math.PI / 180;
    var cardH = infoCard.offsetHeight;
    var cardCenterX = cardRect.left + cardRect.width / 2 - svgRect.left;
    var cardCenterY = cardRect.top + cardRect.height / 2 - svgRect.top;
    var x2 = cardCenterX - (cardH / 2) * Math.sin(angle);
    var y2 = cardCenterY - (cardH / 2) * Math.cos(angle);
    connectorLine.setAttribute('x1', x1);
    connectorLine.setAttribute('y1', y1);
    connectorLine.setAttribute('x2', x2);
    connectorLine.setAttribute('y2', y2);
    connectorLine.setAttribute('opacity', '1');
  }

  var openSpine = null;
  var isAnimating = false;
  var isDetailView = false;

  var centerLeft = 0;        // book3d의 시작 left (main 기준)
  var stageNaturalCenter = 0; // viewport 좌표 — shelf 이동 시 사용
  var SHELF_WIDTH = 359;

  function openBook(spine) {
    isAnimating = true;
    openSpine = spine;

    // 3D spine 텍스트를 미리 설정해 렌더링 준비
    book3dSpineText.textContent = spine.dataset.spineText || '';

    // 1. (0-300ms) 배치 그대로, 다른 spine 페이드아웃
    staticSpines.forEach(function (s) {
      if (s !== spine) {
        s.style.opacity = '0';
        s.style.pointerEvents = 'none';
      }
    });

    // 2. (300ms) 병렬 진행 시작:
    //    a) 클릭 spine — 해당 위치에서 직립(200ms) → 중앙 이동 + 너비/높이 축소(300ms)
    //    b) start-info — 우측으로 슬라이드 아웃
    //    c) header — 슬라이드 다운
    setTimeout(function () {
      // b, c: start-info / header 동시 시작
      document.body.classList.add('book-active');
      headerTitle.textContent = spine.dataset.title || '';
      headerAuthor.textContent = spine.dataset.author || '';
      headerYear.textContent = spine.dataset.year || '';
      headerEl.classList.add('book-open');

      // a-1: (300-800ms) 해당 위치에서 직립 (500ms)
      //      + 동시에 spine 색을 #ffffff → #D3D3D3로 전환 (400ms)
      spine.style.transition =
        'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1),' +
        'background-color 0.4s ease';
      spine.style.transform = 'rotate(0deg)';
      spine.style.backgroundColor = '#D3D3D3';

      setTimeout(function () {
        // a-2: (800-1200ms) 직립 상태 그대로 좌우 위치만 이동 (400ms)
        //      높이/너비는 변경 없음, 바닥 고정
        var spineRect = spine.getBoundingClientRect();
        var mainRect = mainEl.getBoundingClientRect();
        var centerX = mainRect.left + mainRect.width / 2;
        var dx = centerX - (spineRect.left + spineRect.width / 2);

        spine.style.transition =
          'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1),' +
          'opacity 0.3s ease';
        spine.style.transform = 'translateX(' + dx + 'px) rotate(0deg)';

        setTimeout(function () {
          // a-3: (1200-1600ms) 중앙 도착 후 높이 축소 + 세로 중앙으로 이동 (400ms)
          //      book3d의 실제 DOM 위치를 기준으로 정확히 맞춤
          var book3dBCR = book3d.getBoundingClientRect();
          var targetHeight = book3d.offsetHeight;
          var verticalShift = (book3dBCR.bottom - mainRect.bottom + 10);

          spine.style.transition =
            'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1),' +
            'height 0.4s cubic-bezier(0.4, 0, 0.2, 1),' +
            'opacity 0.3s ease';
          spine.style.transform =
            'translateX(' + dx + 'px) translateY(' + verticalShift + 'px) rotate(0deg)';
          spine.style.height = targetHeight + 'px';

          setTimeout(function () {
            // (1600-1800ms) a-3 완료 후 세로 중앙 + 축소된 상태로 200ms 정지
            // 3. (1800ms) swap: 정적 spine → 3D book (둘 다 48×300, 중앙 세로/가로, spine view)
            book3dSpineText.textContent = spine.dataset.spineText || '';
            centerLeft = (mainRect.width - 48) / 2;
            book3d.style.left = centerLeft + 'px';

            spine.style.opacity = '0';
            book3d.classList.add('visible');

            var book3dRect = book3d.getBoundingClientRect();
            stageNaturalCenter = book3dRect.left + book3dRect.width / 2;

            // 4. (1800-3000ms) 3D book 커버 회전 (1200ms)
            book3dInner.style.transition = 'transform 1.2s cubic-bezier(0.4, 0, 0.2, 1)';
            book3dInner.style.transform = 'rotateY(0deg)';

            // 5. (3000-3500ms) 0.5초 대기 — 커버 보임 + header 보임 + 우측 정보 없음
            // 6. (3500ms~) detail view 전환
            setTimeout(function () {
              isAnimating = false;
              showDetailView();
            }, 1350); // 1200ms 회전 + 200ms 대기
          }, 600); // 400ms a-3 + 200ms 정지 머무름
        }, 400);
      }, 500);
    }, 300);
  }

  function showDetailView() {
    isDetailView = true;

    var shelfDx = SHELF_WIDTH / 2 - stageNaturalCenter;
    book3d.style.zIndex = '100';
    book3d.style.transition = 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
    book3d.style.transform = 'translateX(' + shelfDx + 'px)';

    detailView.style.pointerEvents = 'auto';
    shelfPanel.style.transition = 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
    shelfPanel.style.transform = 'translateX(0)';

    setTimeout(function () {
      contentPanel.style.transition = 'opacity 0.4s ease';
      contentPanel.style.opacity = '1';
    }, 500);
  }

  function hideDetailView() {
    isDetailView = false;
    isAnimating = true;

    contentPanel.style.transition = 'opacity 0.4s ease';
    contentPanel.style.opacity = '0';

    book3d.style.transition = 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
    book3d.style.transform = 'translateX(0)';
    book3d.style.zIndex = '2';

    setTimeout(function () {
      detailView.style.pointerEvents = 'none';
      shelfPanel.style.transition = 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
      shelfPanel.style.transform = 'translateX(-100%)';

      setTimeout(function () {
        closeBook();
      }, 500);
    }, 500);
  }

  function closeBook() {
    if (!openSpine) return;
    isAnimating = true;
    var spine = openSpine;
    openSpine = null;

    // 1. (0-1000ms) 3D book → spine view로 회전 (1000ms, open과 대칭)
    book3dInner.style.transition = 'transform 1s cubic-bezier(0.4, 0, 0.2, 1)';
    book3dInner.style.transform = 'rotateY(90deg)';

    setTimeout(function () {
      // 2. (1000ms) swap: 3D book → 정적 spine (둘 다 30×300 중앙)
      book3d.classList.remove('visible');
      book3dInner.style.cssText = '';
      book3d.style.cssText = '';
      spine.style.opacity = '1';

      // 3. (한 프레임 후) 병렬 복귀:
      //    - 정적 spine → 원래 위치/너비/높이/기울기
      //    - header → 슬라이드 업
      //    - start-info → 슬라이드 인
      requestAnimationFrame(function () {
        spine.style.transition =
          'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1),' +
          'height 0.5s cubic-bezier(0.4, 0, 0.2, 1),' +
          'background-color 0.5s ease,' +
          'opacity 0.3s ease';
        spine.style.transform = '';
        spine.style.height = '';
        spine.style.backgroundColor = '';

        headerEl.classList.remove('book-open');
        document.body.classList.remove('book-active');

        // 4. (500ms 후) 다른 spine 페이드인
        setTimeout(function () {
          staticSpines.forEach(function (s) {
            if (s !== spine) {
              s.style.opacity = '1';
              s.style.pointerEvents = '';
            }
          });

          // 5. (300ms 후) cleanup
          setTimeout(function () {
            spine.style.cssText = '';
            staticSpines.forEach(function (s) {
              if (s !== spine) s.style.cssText = '';
            });
            isAnimating = false;
          }, 300);
        }, 500);
      });
    }, 1000);
  }

  // ── Tab 전환 핸들러 ──
  function getTabType(tab) {
    if (tab.classList.contains('tab--designer')) return 'designer';
    if (tab.classList.contains('tab--returned')) return 'returned';
    if (tab.classList.contains('tab--materiality')) return 'materiality';
    return null;
  }

  function selectTab(tab) {
    var tabType = getTabType(tab);
    if (!tabType) return;

    deselectBook();

    // selected state 토글
    tabs.forEach(function (t) { t.classList.remove('tab--selected'); });
    tab.classList.add('tab--selected');

    // sub-tab-bar 업데이트
    var data = TAB_DATA[tabType];
    subTabBar.classList.remove(
      'sub-tab-bar--designer',
      'sub-tab-bar--returned',
      'sub-tab-bar--materiality'
    );
    subTabBar.classList.add(data.modifier);
    subTabName.textContent = data.name;
    subTabDesc.textContent = data.desc;

    // 관련 책 목록 재렌더링
    renderBooks(tabType);
  }

  // 기본 선택: designer 탭
  var defaultTab = document.querySelector('.tab--designer');
  if (defaultTab) selectTab(defaultTab);

  tabs.forEach(function (tab) {
    tab.addEventListener('click', function (e) {
      // detail view 닫기 핸들러로 이벤트 전파 방지
      e.stopPropagation();
      if (isAnimating) return;
      selectTab(tab);
    });
  });

  document.addEventListener('click', function (e) {
    if (isAnimating) return;

    if (isDetailView) {
      if (selectedBook) {
        deselectBook();
        return;
      }
      hideDetailView();
      return;
    }

    var clickedSpine = e.target.closest('.static-spine');
    if (clickedSpine && !openSpine) {
      openBook(clickedSpine);
    } else if (!clickedSpine && openSpine) {
      closeBook();
    }
  });
}());
