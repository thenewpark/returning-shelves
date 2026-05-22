export const EASING = 'cubic-bezier(0.4, 0, 0.2, 1)';

export const TIMING = {
  OPEN_START_DELAY:   300,   // wait after other spines fade out
  SPINE_UPRIGHT:      500,   // spine stands upright
  SPINE_TO_CENTER:    400,   // spine moves to center
  SPINE_SHRINK_TOTAL: 600,   // spine shrinks (400ms) + pause (200ms)
  BOOK_OPEN_TOTAL:   1350,   // cover rotates (1200ms) + settle (150ms)
  DETAIL_SLIDE:       500,   // detail view slides in/out
  CLOSE_ROTATE:      1000,   // cover rotates (close)
  SPINE_RESTORE:      500,   // spine returns to original position
  SPINE_CLEANUP:      300,   // wait before clearing cssText
};

export const SHELF_WIDTH = 359;

export const TAB_DATA = {
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

export const TAB_BOOKS = {
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
