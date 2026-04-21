import { useEffect, useMemo, useRef, type RefObject } from 'react';
import curiousFall from './assets/curious-fall.png';
import decadragesCover from './assets/decadrages-celine-sciamma.webp';
import massMadeUnits from './assets/mass-made-units.png';
import waysOfSeeing from './assets/ways-of-seeing.jpg';
import { useSharedWizardState } from './wizardSync';
import {
  createFourBookSelectedState,
  createLandingState,
  createSingleBookSelectedState,
  createThreeBookSelectedState,
  createTwoBookSelectedState,
  type LocatorContext,
  type ShelfTab,
  type ViewMode,
  type WizardState,
} from './wizardState';

type SelectedBook = {
  id: 'cynophile' | 'macguffin' | 'mind-walks' | 'words';
  title: string;
  author: string;
  year: string;
  thumbnailSrc: string;
  coverSrc?: string;
  kind?: 'words';
};
type SelectedBookId = SelectedBook['id'];
type LocatorCardConfig = {
  text: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
};
type LocatorConfig = {
  noteLines: string[];
  dots: Array<{ x: number; y: number }>;
  lines: Array<{ from: { x: number; y: number }; to: { x: number; y: number } }>;
  cards: LocatorCardConfig[];
  plusBox?: { x: number; y: number; size: number };
  safeZones: Array<{ x: number; y: number; width: number; height: number }>;
  highlightedPosts: {
    top: number[];
    bottom: number[];
  };
};
type BookDisplayConfig = {
  secondaryLabel: string;
  materialityMeta: string;
  locators: Record<LocatorContext, LocatorConfig>;
};

const DEFAULT_SCROLL_LEFT: Record<ViewMode, number> = {
  base: 0,
  returned: 0,
  materiality: 0,
};

const LANDING_GRID_BOOK = '/book5.jpg';
const LANDING_WORDS_BOOK = '/book1.jpg';
const LANDING_LIFE_BOOK = '/book4.jpg';
const LANDING_CYNOPHILE_BOOK = '/book2.jpg';
const LANDING_DOTS_BOOK = '/book3.jpg';
const WORDS_RETURNED_KLIMA = '/image 5.jpg';
const WORDS_RETURNED_AIR = '/image 6.jpg';
const WORDS_RETURNED_WAYS = '/image 10.jpg';
const WORDS_RETURNED_SMLXL = '/image 11.jpg';
const WORDS_RETURNED_PRODUCTION = '/image 12.jpg';
const WORDS_DESIGNER_SCHRIFTEN = '/image 16.jpg';
const CYNOPHILE_DESIGNER_PRIMARY = '/Screenshot 2026-04-20 at 16.03.32 1.jpg';
const CYNOPHILE_DESIGNER_SECONDARY = '/Screenshot 2026-04-20 at 16.04.30 1.jpg';
const CYNOPHILE_MATERIAL_PRIMARY = '/Screenshot 2026-04-20 at 16.12.22 1.jpg';
const CYNOPHILE_MATERIAL_SECONDARY = '/Screenshot 2026-04-20 at 16.12.30 1.jpg';
const MACGUFFIN_DESIGNER_PRIMARY = '/image 1.jpg';
const MACGUFFIN_DESIGNER_SECONDARY = '/image 2.jpg';
const MACGUFFIN_RETURNED_FRONT = '/image 4.jpg';
const MACGUFFIN_MATERIAL_PRIMARY = '/image 8.jpg';
const MACGUFFIN_MATERIAL_SECONDARY = '/image 9.jpg';

const SELECTED_BOOKS: SelectedBook[] = [
  {
    id: 'cynophile',
    title: 'Brigade Cynophile',
    author: 'Poster book 2019-2023',
    year: '2019',
    thumbnailSrc: '/book2.jpg',
    coverSrc: '/book2.jpg',
  },
  {
    id: 'macguffin',
    title: 'ISSUE N°8',
    author: 'The life of things, The Desk',
    year: '2020',
    thumbnailSrc: '/book4.jpg',
    coverSrc: '/book4.jpg',
  },
  {
    id: 'mind-walks',
    title: 'Mind Walks Reprint',
    author: 'Karl Nawrot',
    year: 'Reprint',
    thumbnailSrc: '/book3.jpg',
    coverSrc: '/book3.jpg',
  },
  {
    id: 'words',
    title: 'Words form language',
    author: 'Eugen Gomringer',
    year: '2021',
    thumbnailSrc: '/book1.jpg',
    coverSrc: '/book1.jpg',
    kind: 'words',
  },
];
const BOOK_DISPLAY_CONFIGS: Record<SelectedBookId, BookDisplayConfig> = {
  words: {
    secondaryLabel: 'Omnigroup',
    materialityMeta: 'Paperback, 24 ×16 ×2.3 cm, 220 pages',
    locators: {
      base: {
        noteLines: ['The book is located', 'here in the library:', 'AV-190830'],
        dots: [{ x: 67, y: 166 }],
        lines: [{ from: { x: 67, y: 166 }, to: { x: 640, y: 418 } }],
        cards: [{ text: 'Mass Made Units', x: 529, y: 361, width: 213, height: 81, rotation: -14 }],
        safeZones: [{ x: 417, y: 112, width: 421, height: 554 }],
        highlightedPosts: { top: [0], bottom: [] },
      },
      returned: {
        noteLines: ['The selection [2 books]', 'is located here in the library:', 'AV-19083 + DG-92834'],
        dots: [
          { x: 194, y: 276 },
          { x: 67, y: 593 },
        ],
        lines: [
          { from: { x: 194, y: 276 }, to: { x: 646, y: 392 } },
          { from: { x: 67, y: 593 }, to: { x: 772, y: 424 } },
        ],
        cards: [
          { text: 'ISSUE N°7,The Trousers', x: 534, y: 340, width: 283, height: 75, rotation: -14 },
          { text: 'N°51, N°52, Décadrages', x: 662, y: 379, width: 276, height: 74, rotation: -14 },
        ],
        plusBox: { x: 635, y: 394, size: 34 },
        safeZones: [{ x: 443, y: 167, width: 596, height: 494 }],
        highlightedPosts: { top: [1], bottom: [0] },
      },
      materiality: {
        noteLines: ['The book is located', 'here in the library:', 'DG-92352'],
        dots: [{ x: 194, y: 694 }],
        lines: [{ from: { x: 194, y: 694 }, to: { x: 581, y: 494 } }],
        cards: [{ text: 'Ways of Seeing.', x: 495, y: 438, width: 187, height: 79, rotation: -14 }],
        safeZones: [{ x: 418, y: 222, width: 339, height: 556 }],
        highlightedPosts: { top: [], bottom: [1] },
      },
    },
  },
  cynophile: {
    secondaryLabel: 'Brigade Cynophile',
    materialityMeta: 'Softcover with jacket, 100 pages, 22 × 31cm',
    locators: {
      base: {
        noteLines: ['The book is located', 'here in the library:', 'AV-190830'],
        dots: [{ x: 188, y: 166 }],
        lines: [{ from: { x: 188, y: 166 }, to: { x: 603, y: 417 } }],
        cards: [{ text: 'Ventoline.', x: 546, y: 360, width: 139, height: 69, rotation: -14 }],
        safeZones: [{ x: 419, y: 159, width: 185, height: 377 }],
        highlightedPosts: { top: [1], bottom: [] },
      },
      returned: {
        noteLines: ['The selection [2 books]', 'is located here in the library:', 'AV-19083 + DG-92834'],
        dots: [
          { x: 194, y: 276 },
          { x: 67, y: 593 },
        ],
        lines: [
          { from: { x: 194, y: 276 }, to: { x: 633, y: 396 } },
          { from: { x: 67, y: 593 }, to: { x: 743, y: 425 } },
        ],
        cards: [
          { text: 'ISSUE N°4,The Sink', x: 548, y: 347, width: 235, height: 72, rotation: -14 },
          { text: 'Ventoline', x: 733, y: 383, width: 133, height: 67, rotation: -14 },
        ],
        plusBox: { x: 694, y: 391, size: 34 },
        safeZones: [{ x: 409, y: 168, width: 423, height: 493 }],
        highlightedPosts: { top: [1], bottom: [0] },
      },
      materiality: {
        noteLines: ['The book is located', 'here in the library:', 'DG-92352'],
        dots: [{ x: 194, y: 694 }],
        lines: [{ from: { x: 194, y: 694 }, to: { x: 578, y: 494 } }],
        cards: [{ text: "All Work is Women's Work.", x: 470, y: 444, width: 242, height: 74, rotation: -14 }],
        safeZones: [{ x: 419, y: 222, width: 292, height: 555 }],
        highlightedPosts: { top: [], bottom: [1] },
      },
    },
  },
  macguffin: {
    secondaryLabel: 'MacGuffin',
    materialityMeta: 'Softcover, 224 pages, 21×28 cm',
    locators: {
      base: {
        noteLines: ['The book is located', 'here in the library:', 'AV-190830'],
        dots: [{ x: 194, y: 166 }],
        lines: [{ from: { x: 194, y: 166 }, to: { x: 663, y: 414 } }],
        cards: [{ text: 'ISSUE N°7, The Trousers', x: 603, y: 360, width: 295, height: 74, rotation: -14 }],
        safeZones: [{ x: 418, y: 160, width: 223, height: 389 }],
        highlightedPosts: { top: [1], bottom: [] },
      },
      returned: {
        noteLines: ['The selection [2 books]', 'is located here in the library:', 'AV-19083 + DG-92834'],
        dots: [
          { x: 194, y: 276 },
          { x: 67, y: 593 },
        ],
        lines: [
          { from: { x: 194, y: 276 }, to: { x: 622, y: 402 } },
          { from: { x: 67, y: 593 }, to: { x: 764, y: 430 } },
        ],
        cards: [
          { text: 'Air Power / Peace Power', x: 503, y: 386, width: 206, height: 66, rotation: -14 },
          { text: 'N°51,N°52,Décadrages', x: 689, y: 398, width: 232, height: 70, rotation: -14 },
        ],
        plusBox: { x: 671, y: 401, size: 34 },
        safeZones: [{ x: 420, y: 168, width: 406, height: 493 }],
        highlightedPosts: { top: [1], bottom: [0] },
      },
      materiality: {
        noteLines: ['The book is located', 'here in the library:', 'DG-92352'],
        dots: [{ x: 229, y: 695 }],
        lines: [{ from: { x: 229, y: 695 }, to: { x: 590, y: 504 } }],
        cards: [{ text: 'apartamento', x: 504, y: 447, width: 149, height: 66, rotation: -14 }],
        safeZones: [{ x: 420, y: 222, width: 266, height: 555 }],
        highlightedPosts: { top: [], bottom: [1] },
      },
    },
  },
  'mind-walks': {
    secondaryLabel: 'Karl Nawrot',
    materialityMeta: 'Paperback, 24 ×16 ×2.3 cm, 220 pages',
    locators: {
      base: {
        noteLines: ['The book is located', 'here in the library:', 'AV-190830'],
        dots: [{ x: 67, y: 166 }],
        lines: [{ from: { x: 67, y: 166 }, to: { x: 640, y: 418 } }],
        cards: [{ text: 'Mass Made Units', x: 529, y: 361, width: 213, height: 81, rotation: -14 }],
        safeZones: [{ x: 417, y: 112, width: 421, height: 554 }],
        highlightedPosts: { top: [0], bottom: [] },
      },
      returned: {
        noteLines: ['The selection [2 books]', 'is located here in the library:', 'AV-19083 + DG-92834'],
        dots: [
          { x: 194, y: 276 },
          { x: 67, y: 593 },
        ],
        lines: [
          { from: { x: 194, y: 276 }, to: { x: 646, y: 392 } },
          { from: { x: 67, y: 593 }, to: { x: 772, y: 424 } },
        ],
        cards: [
          { text: 'ISSUE N°7,The Trousers', x: 534, y: 340, width: 283, height: 75, rotation: -14 },
          { text: 'N°51, N°52, Décadrages', x: 662, y: 379, width: 276, height: 74, rotation: -14 },
        ],
        plusBox: { x: 635, y: 394, size: 34 },
        safeZones: [{ x: 443, y: 167, width: 596, height: 494 }],
        highlightedPosts: { top: [1], bottom: [0] },
      },
      materiality: {
        noteLines: ['The book is located', 'here in the library:', 'DG-92352'],
        dots: [{ x: 194, y: 694 }],
        lines: [{ from: { x: 194, y: 694 }, to: { x: 581, y: 494 } }],
        cards: [{ text: 'Ways of Seeing.', x: 495, y: 438, width: 187, height: 79, rotation: -14 }],
        safeZones: [{ x: 418, y: 222, width: 339, height: 556 }],
        highlightedPosts: { top: [], bottom: [1] },
      },
    },
  },
};

function WordsCover() {
  const repeatedTitleBlocks = Array.from({ length: 5 });

  return (
    <div className="words-cover">
      <div className="words-cover__spine">
        on Concrete Poetry, Typography, and the Work of Eugen Gomringer
      </div>
      <div className="words-cover__title-cluster">
        {repeatedTitleBlocks.map((_, index) => (
          <div key={index} className="words-cover__title-block">
            words form language
          </div>
        ))}
      </div>
    </div>
  );
}

function BookInfoPanel({ title, author, year }: { title: string; author: string; year: string }) {
  return (
    <article className="detail-card detail-card--info">
      <p>{title}</p>
      <p>{author}</p>
      <p>{year}</p>
    </article>
  );
}

function InfoPanel() {
  return <BookInfoPanel title="Words form language" author="Eugen Gomringer" year="2021" />;
}

function SingleAsidePanel({ book }: { book: SelectedBook }) {
  return (
    <aside className="shelf-aside">
      <article className="book book--words" aria-label={book.title}>
        <SelectedBookCover book={book} large />
      </article>
      <BookInfoPanel title={book.title} author={book.author} year={book.year} />
    </aside>
  );
}

function SelectedBookCover({ book, large = false }: { book: SelectedBook; large?: boolean }) {
  if (book.kind === 'words' && large && !book.coverSrc) {
    return <WordsCover />;
  }

  return (
    <img
      className={`selected-book-cover__image ${large ? 'selected-book-cover__image--large' : ''}`}
      src={book.coverSrc ?? book.thumbnailSrc}
      alt={book.title}
    />
  );
}

function LocatorAsidePanel({ config }: { config: LocatorConfig }) {
  const highlightedPosts = config.highlightedPosts;

  return (
    <aside className="shelf-aside shelf-aside--locator" aria-label="Library location">
      <div className="locator-shelves">
        <div className="locator-shelves__row locator-shelves__row--top">
          {[0, 1, 2].map((index) => (
            <span
              key={`top-${index}`}
              className={`locator-shelves__post ${highlightedPosts.top.includes(index) ? 'locator-shelves__post--dark' : ''}`}
            />
          ))}
        </div>
        <div className="locator-shelves__row locator-shelves__row--bottom">
          {[0, 1, 2].map((index) => (
            <span
              key={`bottom-${index}`}
              className={`locator-shelves__post ${highlightedPosts.bottom.includes(index) ? 'locator-shelves__post--dark' : ''}`}
            />
          ))}
        </div>
      </div>
    </aside>
  );
}

function LocatorOverlay({
  config,
  onClose,
}: {
  config: LocatorConfig;
  onClose: () => void;
}) {
  return (
    <div className="locator-overlay" aria-label="Selected book location hint" onClick={onClose}>
      <div className="locator-note" onClick={(event) => event.stopPropagation()}>
        {config.noteLines.map((line) => (
          <p key={line}>{line}</p>
        ))}
      </div>
      <svg
        className="locator-connector"
        viewBox="0 0 1194 834"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        {config.lines.map((line) => (
          <path
            key={`${line.from.x}-${line.from.y}-${line.to.x}-${line.to.y}`}
            d={`M${line.from.x} ${line.from.y}L${line.to.x} ${line.to.y}`}
            stroke="#050505"
            strokeWidth="1"
          />
        ))}
      </svg>
      {config.dots.map((dot) => (
        <div
          key={`${dot.x}-${dot.y}`}
          className="locator-dot"
          style={{ left: `${(dot.x / 1194) * 100}%`, top: `${(dot.y / 834) * 100}%` }}
        />
      ))}
      {config.safeZones.map((safeZone, index) => (
        <div
          key={`safe-zone-${index}`}
          className="locator-safe-zone"
          style={{
            left: `${(safeZone.x / 1194) * 100}%`,
            top: `${(safeZone.y / 834) * 100}%`,
            width: `${(safeZone.width / 1194) * 100}%`,
            height: `${(safeZone.height / 834) * 100}%`,
          }}
          onClick={(event) => event.stopPropagation()}
        />
      ))}
      {config.cards.map((card) => (
        <div
          key={card.text}
          className="locator-card"
          style={{
            left: `${(card.x / 1194) * 100}%`,
            top: `${(card.y / 834) * 100}%`,
            width: `${(card.width / 1194) * 100}%`,
            height: `${(card.height / 834) * 100}%`,
            transform: `rotate(${card.rotation}deg)`,
          }}
          onClick={(event) => event.stopPropagation()}
        >
          <span>{card.text}</span>
        </div>
      ))}
      {config.plusBox ? (
        <div
          className="locator-plus-box"
          style={{
            left: `${(config.plusBox.x / 1194) * 100}%`,
            top: `${(config.plusBox.y / 834) * 100}%`,
            width: `${(config.plusBox.size / 1194) * 100}%`,
            height: `${(config.plusBox.size / 834) * 100}%`,
          }}
          onClick={(event) => event.stopPropagation()}
        >
          +
        </div>
      ) : null}
    </div>
  );
}

function MultiAsidePanel({
  books,
  activeBookId,
  onSelectBook,
  onPrev,
  onNext,
}: {
  books: SelectedBook[];
  activeBookId: string;
  onSelectBook: (bookId: string) => void;
  onPrev: () => void;
  onNext: () => void;
}) {
  const activeBook = books.find((book) => book.id === activeBookId) ?? books[books.length - 1] ?? SELECTED_BOOKS[3];
  const thumbnailBooks = books.filter((book) => book.id !== activeBook.id);

  return (
    <aside className="shelf-aside shelf-aside--multi">
      <div className="selected-book-strip" aria-label="Selected books">
        {thumbnailBooks.map((book) => (
          <button
            key={book.id}
            type="button"
            className="selected-book-thumb"
            aria-label={`Select ${book.title}`}
            onClick={() => onSelectBook(book.id)}
          >
            <SelectedBookCover book={book} />
          </button>
        ))}
      </div>

      <article className="selected-book-large" aria-label={activeBook.title}>
        <SelectedBookCover book={activeBook} large />
      </article>

      <div className="selected-book-nav" aria-label="Selected book navigation">
        <button
          type="button"
          className="selected-book-nav__button"
          aria-label="Previous selected book"
          onClick={onPrev}
        >
          {'<'}
        </button>
        <button
          type="button"
          className="selected-book-nav__button"
          aria-label="Next selected book"
          onClick={onNext}
        >
          {'>'}
        </button>
      </div>

      <BookInfoPanel title={activeBook.title} author={activeBook.author} year={activeBook.year} />
    </aside>
  );
}

function NewDarkAgeCover() {
  return (
    <div className="new-dark-age" aria-label="New Dark Age">
      <div className="new-dark-age__edition">NEW EDITION</div>
      <div className="new-dark-age__title">
        <span>New</span>
        <span>Dark Age</span>
      </div>
      <div className="new-dark-age__burst" />
      <div className="new-dark-age__subtitle">
        <span>Technology</span>
        <span>and the</span>
        <span>End of the</span>
        <span>Future</span>
      </div>
      <div className="new-dark-age__author">
        <span>James</span>
        <span>Bridle</span>
      </div>
      <div className="new-dark-age__quote">"Brilliant and bracing" – Guardian</div>
    </div>
  );
}

function LandingView({ onStart }: { onStart: () => void }) {
  return (
    <section className="landing-board" aria-label="Return Shelf Machine landing page">
      <div className="landing-canvas">
        <article className="landing-piece landing-piece--grid-book" aria-hidden="true">
          <img className="landing-piece__image" src={LANDING_GRID_BOOK} alt="" />
        </article>

        <article className="landing-piece landing-piece--cynophile" aria-hidden="true">
          <img className="landing-piece__image" src={LANDING_CYNOPHILE_BOOK} alt="" />
        </article>

        <article className="landing-piece landing-piece--life" aria-hidden="true">
          <img className="landing-piece__image" src={LANDING_LIFE_BOOK} alt="" />
        </article>

        <article className="landing-piece landing-piece--dots" aria-hidden="true">
          <img className="landing-piece__image" src={LANDING_DOTS_BOOK} alt="" />
        </article>

        <article className="landing-piece landing-piece--words" aria-hidden="true">
          <img className="landing-piece__image" src={LANDING_WORDS_BOOK} alt="" />
        </article>
      </div>

      <aside className="landing-info">
        <h1 className="landing-info__title">Return Shelf Machine</h1>
        <p className="landing-info__subtitle">
          Find references you wouldn&apos;t have
          <br />
          thought to search for.
        </p>
        <button type="button" className="landing-info__button" onClick={onStart}>
          Pick up a book to start exploration
        </button>
      </aside>
    </section>
  );
}

function railWidth(value: number) {
  return `calc(100% * ${value} / 833)`;
}

function StateHeader({
  secondaryLabel,
  onBack,
}: {
  secondaryLabel: string;
  onBack: () => void;
}) {
  return (
    <div className="state-header">
      <button type="button" className="state-header__designer" onClick={onBack}>
        Designer
      </button>
      <div className="state-header__secondary">{secondaryLabel}</div>
    </div>
  );
}

function BaseView({
  activeTab,
  secondaryLabel,
  bookId,
  onSelectTab,
  onReturned,
  onMateriality,
  onLocate,
  railRef,
}: {
  activeTab: ShelfTab;
  secondaryLabel: string;
  bookId: SelectedBookId;
  onSelectTab: (tab: ShelfTab) => void;
  onReturned: () => void;
  onMateriality: () => void;
  onLocate: () => void;
  railRef: RefObject<HTMLDivElement | null>;
}) {
  return (
    <>
      <div className="selector-strip" data-node-id="331:7797">
        {[
          { tab: 'Designer' as const, label: 'Designer', className: 'selector-strip__tab--primary' },
          { tab: 'Omnigroup' as const, label: secondaryLabel, className: 'selector-strip__tab--secondary' },
        ].map(({ tab, label, className }) => (
          <button
            key={tab}
            type="button"
            className={`selector-strip__tab ${className} ${activeTab === tab ? 'is-active' : ''}`}
            onClick={() => onSelectTab(tab)}
            aria-pressed={activeTab === tab}
          >
            {label}
          </button>
        ))}
      </div>

      <section className="books-stage" data-node-id="331:7801">
        <div className="rail-viewport rail-viewport--base" ref={railRef}>
          {bookId === 'cynophile' ? (
            <div className="rail-track rail-track--base">
              <button
                type="button"
                className="related-cover-button related-cover-button--base"
                aria-label="Locate Ventoline"
                onClick={onLocate}
              >
                <img className="related-cover-image" src={CYNOPHILE_DESIGNER_PRIMARY} alt="Ventoline N°3 cover" />
              </button>

              <article className="related-cover-card related-cover-card--base">
                <img
                  className="related-cover-image"
                  src={CYNOPHILE_DESIGNER_SECONDARY}
                  alt="Meridian Brothers poster cover"
                />
              </article>
            </div>
          ) : bookId === 'macguffin' ? (
            <div className="rail-track rail-track--base">
              <button
                type="button"
                className="related-cover-button related-cover-button--base"
                aria-label="Locate ISSUE N°7, The Trousers"
                onClick={onLocate}
              >
                <img className="related-cover-image" src={MACGUFFIN_DESIGNER_PRIMARY} alt="ISSUE N°7, The Trousers cover" />
              </button>

              <article className="related-cover-card related-cover-card--base">
                <img className="related-cover-image" src={MACGUFFIN_DESIGNER_SECONDARY} alt="ISSUE N°6, The Ball cover" />
              </article>
            </div>
          ) : (
            <div className="rail-track rail-track--base">
              <button
                type="button"
                className="rail-item rail-item--mass rail-item-button"
                aria-label="Locate Mass Made Units"
                onClick={onLocate}
              >
                <img className="book__image" src={massMadeUnits} alt="Mass Made Units cover" />
              </button>

              <article
                className="rail-item rail-item--curious"
                aria-label="The Curious Fall of a Child Who Knew Nothing and Became Everything"
              >
                <img
                  className="book__image"
                  src={curiousFall}
                  alt="The Curious Fall of a Child Who Knew Nothing and Became Everything page spread"
                />
              </article>

              <article className="rail-item rail-item--schriften" aria-label="Schriften Lettering Ecritures">
                <img
                  className="book__image"
                  src={WORDS_DESIGNER_SCHRIFTEN}
                  alt="Schriften Lettering Ecritures cover"
                />
              </article>
            </div>
          )}
        </div>
      </section>

      <div className="detail-band">
        <article className="detail-card detail-card--tags">
          <button type="button" className="tag-swatch tag-swatch--0" onClick={onReturned}>
            Returned with
          </button>
          <button type="button" className="tag-swatch tag-swatch--1" onClick={onMateriality}>
            Materiality
          </button>
        </article>
      </div>
    </>
  );
}

function ReturnedView({
  secondaryLabel,
  bookId,
  onBack,
  onMateriality,
  onLocate,
  railRef,
}: {
  secondaryLabel: string;
  bookId: SelectedBookId;
  onBack: () => void;
  onMateriality: () => void;
  onLocate: () => void;
  railRef: RefObject<HTMLDivElement | null>;
}) {
  return (
    <>
      <StateHeader secondaryLabel={secondaryLabel} onBack={onBack} />

      <div className="state-tag-row state-tag-row--returned">
        <button type="button" className="state-tag state-tag--lime state-tag--active">
          Returned with
        </button>
      </div>

      <section className="returned-stage">
        <div className="rail-viewport rail-viewport--returned" ref={railRef}>
          {bookId === 'cynophile' ? (
            <div className="rail-track rail-track--returned">
              <button
                type="button"
                className="returned-cluster returned-cluster-button returned-stage__stack"
                style={{ width: railWidth(427) }}
                aria-label="Locate returned-with Ventoline and ISSUE N°4, The Sink"
                onClick={onLocate}
              >
                <img className="returned-stage__stack-back" src={CYNOPHILE_DESIGNER_PRIMARY} alt="Ventoline N°3 cover" />
                <img
                  className="returned-stage__stack-front returned-stage__stack-front--sink"
                  src={MACGUFFIN_RETURNED_FRONT}
                  alt="ISSUE N°4, The Sink cover"
                />
              </button>

              <article className="returned-stage__side-cover returned-stage__side-cover--full">
                <img className="related-cover-image" src={MACGUFFIN_MATERIAL_PRIMARY} alt="apartamento issue cover" />
              </article>
            </div>
          ) : bookId === 'macguffin' ? (
            <div className="rail-track rail-track--returned">
              <button
                type="button"
                className="returned-cluster returned-cluster-button returned-stage__stack"
                style={{ width: railWidth(426) }}
                aria-label="Locate returned-with Air Power / Peace Power and Décadrages"
                onClick={onLocate}
              >
                <div className="returned-stage__green-book" aria-hidden="true">
                  <div className="returned-stage__green-book-label">Air Power</div>
                  <div className="returned-stage__green-book-label">/ Peace Power</div>
                </div>
                <img
                  className="returned-stage__stack-front returned-stage__stack-front--decadrages"
                  src={decadragesCover}
                  alt="Décadrages Céline Sciamma cover"
                />
              </button>

              <article className="returned-stage__side-cover returned-stage__side-cover--full">
                <img
                  className="related-cover-image"
                  src={CYNOPHILE_DESIGNER_SECONDARY}
                  alt="Meridian Brothers poster cover"
                />
              </article>
            </div>
          ) : (
            <div className="rail-track rail-track--returned rail-track--returned-words">
              <div className="returned-stage__words-canvas">
                <button
                  type="button"
                  className="returned-stage__words-stack returned-stage__words-stack--one"
                  aria-label="Locate returned-with selection"
                  onClick={onLocate}
                >
                  <div className="returned-stage__tote returned-stage__tote--words" aria-hidden="true">
                    <div className="returned-stage__tote-print returned-stage__tote-print--left" />
                    <div className="returned-stage__tote-print returned-stage__tote-print--right" />
                    <svg
                      className="returned-stage__strap"
                      viewBox="0 0 360 470"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M35 430C48 325 83 250 135 165C168 110 184 78 194 66C204 54 214 49 222 58C230 67 232 85 232 111C232 167 230 248 227 368"
                        stroke="#EA0C10"
                        strokeWidth="8"
                        strokeLinecap="round"
                      />
                    </svg>
                  </div>

                  <img
                    className="returned-stage__decadrages returned-stage__decadrages--words"
                    src={decadragesCover}
                    alt="Décadrages Céline Sciamma cover"
                  />
                </button>

                {/* <div className="returned-stage__magenta-book returned-stage__magenta-book--words" aria-hidden="true">
                  <div className="returned-stage__magenta-inset" />
                  <div className="returned-stage__magenta-letter">d</div>
                </div> */}

                <img className="returned-stage__words-related returned-stage__words-related--klima" src={WORDS_RETURNED_KLIMA} alt="klima cover" />
                <img
                  className="returned-stage__words-related returned-stage__words-related--air"
                  src={WORDS_RETURNED_AIR}
                  alt="Air Power / Peace Power cover"
                />
                <img
                  className="returned-stage__words-related returned-stage__words-related--smlxl"
                  src={WORDS_RETURNED_SMLXL}
                  alt="S,M,L,XL cover"
                />
                <img
                  className="returned-stage__words-related returned-stage__words-related--production"
                  src={WORDS_RETURNED_PRODUCTION}
                  alt="The Production Issue cover"
                />
                <img
                  className="returned-stage__words-related returned-stage__words-related--ways"
                  src={WORDS_RETURNED_WAYS}
                  alt="Ways of Seeing cover"
                />
              </div>
            </div>
          )}
        </div>
      </section>

      <div className="detail-band">
        <article className="detail-card detail-card--tags">
          <button type="button" className="tag-swatch tag-swatch--1" onClick={onMateriality}>
            Materiality
          </button>
        </article>
      </div>
    </>
  );
}

function MaterialityView({
  secondaryLabel,
  bookId,
  materialityMeta,
  onBack,
  onReturned,
  onLocate,
  railRef,
}: {
  secondaryLabel: string;
  bookId: SelectedBookId;
  materialityMeta: string;
  onBack: () => void;
  onReturned: () => void;
  onLocate: () => void;
  railRef: RefObject<HTMLDivElement | null>;
}) {
  return (
    <>
      <StateHeader secondaryLabel={secondaryLabel} onBack={onBack} />

      <div className="state-tag-row state-tag-row--returned">
        <button type="button" className="state-tag state-tag--lime" onClick={onReturned}>
          Returned with
        </button>
      </div>

      <div className="state-tag-row state-tag-row--materiality">
        <button type="button" className="state-tag state-tag--pink state-tag--active">
          Materiality
        </button>
        <div className="state-tag-row__meta">{materialityMeta}</div>
      </div>

      <section className="materiality-stage">
        <div className="rail-viewport rail-viewport--materiality" ref={railRef}>
          {bookId === 'cynophile' ? (
            <div className="rail-track rail-track--materiality">
              <button
                type="button"
                className="materiality-stage__cover-button materiality-stage__cover-button--full"
                aria-label="Locate All Work is Women's Work"
                onClick={onLocate}
              >
                <img
                  className="materiality-stage__cover"
                  src={CYNOPHILE_MATERIAL_PRIMARY}
                  alt="All Work is Women's Work cover"
                />
              </button>

              <article className="materiality-stage__cover-card materiality-stage__cover-card--full">
                <img className="materiality-stage__cover" src={CYNOPHILE_MATERIAL_SECONDARY} alt="Piecing Pages cover" />
              </article>
            </div>
          ) : bookId === 'macguffin' ? (
            <div className="rail-track rail-track--materiality">
              <button
                type="button"
                className="materiality-stage__cover-button materiality-stage__cover-button--full"
                aria-label="Locate apartamento"
                onClick={onLocate}
              >
                <img className="materiality-stage__cover" src={MACGUFFIN_MATERIAL_PRIMARY} alt="apartamento cover" />
              </button>

              <article className="materiality-stage__cover-card materiality-stage__cover-card--full">
                <img className="materiality-stage__cover" src={MACGUFFIN_MATERIAL_SECONDARY} alt="the gentlewoman cover" />
              </article>
            </div>
          ) : (
            <div className="rail-track rail-track--materiality rail-track--materiality-words">
              <button
                type="button"
                className="materiality-stage__ways-button materiality-stage__ways-button--words"
                aria-label="Locate Ways of Seeing"
                onClick={onLocate}
              >
                <img
                  className="materiality-stage__ways"
                  src={waysOfSeeing}
                  alt="Ways of Seeing by John Berger"
                />
              </button>

              <div className="materiality-stage__dark-age materiality-stage__dark-age--words">
                <NewDarkAgeCover />
              </div>
            </div>
          )}
        </div>
      </section>

      <div className="detail-band" aria-hidden="true" />
    </>
  );
}

function collapseLocatorState(currentState: WizardState): WizardState {
  if (currentState.selectionMode !== 'locator') return currentState;

  return {
    ...currentState,
    selectionMode: currentState.locatorReturnMode,
  };
}

function DisplayApp() {
  const { state, setState } = useSharedWizardState();
  const baseRailRef = useRef<HTMLDivElement>(null);
  const returnedRailRef = useRef<HTMLDivElement>(null);
  const materialityRailRef = useRef<HTMLDivElement>(null);
  const selectedBooks = useMemo(
    () => SELECTED_BOOKS.filter((book) => state.selectedBookIds.includes(book.id)),
    [state.selectedBookIds],
  );
  const activeSelectedBook =
    selectedBooks.find((book) => book.id === state.activeSelectedBookId) ??
    SELECTED_BOOKS.find((book) => book.id === state.activeSelectedBookId) ??
    SELECTED_BOOKS[3];
  const activeBookDisplay = BOOK_DISPLAY_CONFIGS[activeSelectedBook.id] ?? BOOK_DISPLAY_CONFIGS.words;

  useEffect(() => {
    const railMap = {
      base: baseRailRef.current,
      returned: returnedRailRef.current,
      materiality: materialityRailRef.current,
    } as const;

    const activeRail = railMap[state.viewMode];
    if (!activeRail) return;
    activeRail.scrollLeft = DEFAULT_SCROLL_LEFT[state.viewMode];
  }, [state.viewMode]);

  const handlePrevSelectedBook = () => {
    if (selectedBooks.length === 0) return;

    void setState((currentState) => {
      const currentBooks = SELECTED_BOOKS.filter((book) => currentState.selectedBookIds.includes(book.id));
      const activeIndex = currentBooks.findIndex((book) => book.id === currentState.activeSelectedBookId);
      const prevIndex = (activeIndex - 1 + currentBooks.length) % currentBooks.length;
      const previousBook = currentBooks[prevIndex] ?? currentBooks[currentBooks.length - 1];

      return {
        ...currentState,
        activeSelectedBookId: previousBook.id,
      };
    });
  };

  const handleNextSelectedBook = () => {
    if (selectedBooks.length === 0) return;

    void setState((currentState) => {
      const currentBooks = SELECTED_BOOKS.filter((book) => currentState.selectedBookIds.includes(book.id));
      const activeIndex = currentBooks.findIndex((book) => book.id === currentState.activeSelectedBookId);
      const nextIndex = (activeIndex + 1) % currentBooks.length;
      const nextBook = currentBooks[nextIndex] ?? currentBooks[0];

      return {
        ...currentState,
        activeSelectedBookId: nextBook.id,
      };
    });
  };

  const openLocator = (context: LocatorContext) => {
    void setState((currentState) => ({
      ...currentState,
      locatorContext: context,
      locatorReturnMode:
        currentState.selectionMode === 'locator'
          ? currentState.locatorReturnMode
          : currentState.selectionMode === 'single'
            ? 'single'
            : 'multi',
      selectionMode: 'locator',
    }));
  };

  const closeLocator = () => {
    void setState((currentState) => collapseLocatorState(currentState));
  };

  const setViewMode = (viewMode: ViewMode) => {
    void setState((currentState) => ({
      ...collapseLocatorState(currentState),
      screenMode: 'shelves',
      viewMode,
    }));
  };

  return (
    <div className="shelf-page">
      {state.screenMode === 'landing' ? (
        <LandingView
          onStart={() => {
            void setState(createFourBookSelectedState('words'));
          }}
        />
      ) : null}

      {state.screenMode === 'shelves' ? (
        <section className={`shelf-board shelf-board--${state.viewMode}`} aria-label="Returning shelves interface">
          {state.selectionMode === 'single' ? (
            <SingleAsidePanel book={activeSelectedBook} />
          ) : state.selectionMode === 'locator' ? (
            <LocatorAsidePanel config={activeBookDisplay.locators[state.locatorContext]} />
          ) : (
            <MultiAsidePanel
              books={selectedBooks}
              activeBookId={state.activeSelectedBookId}
              onSelectBook={(bookId) => {
                void setState((currentState) => ({
                  ...currentState,
                  activeSelectedBookId: bookId,
                }));
              }}
              onPrev={handlePrevSelectedBook}
              onNext={handleNextSelectedBook}
            />
          )}
          {state.selectionMode === 'locator' ? (
            <LocatorOverlay config={activeBookDisplay.locators[state.locatorContext]} onClose={closeLocator} />
          ) : null}
          <main className="shelf-main">
            {state.viewMode === 'base' ? (
              <BaseView
                activeTab={state.activeTab}
                secondaryLabel={activeBookDisplay.secondaryLabel}
                bookId={activeSelectedBook.id}
                onSelectTab={(nextTab) => {
                  void setState((currentState) => ({
                    ...currentState,
                    activeTab: nextTab,
                  }));
                }}
                onReturned={() => setViewMode('returned')}
                onMateriality={() => setViewMode('materiality')}
                onLocate={() => openLocator('base')}
                railRef={baseRailRef}
              />
            ) : null}

            {state.viewMode === 'returned' ? (
              <ReturnedView
                secondaryLabel={activeBookDisplay.secondaryLabel}
                bookId={activeSelectedBook.id}
                onBack={() => setViewMode('base')}
                onMateriality={() => setViewMode('materiality')}
                onLocate={() => openLocator('returned')}
                railRef={returnedRailRef}
              />
            ) : null}

            {state.viewMode === 'materiality' ? (
              <MaterialityView
                secondaryLabel={activeBookDisplay.secondaryLabel}
                bookId={activeSelectedBook.id}
                materialityMeta={activeBookDisplay.materialityMeta}
                onBack={() => setViewMode('base')}
                onReturned={() => setViewMode('returned')}
                onLocate={() => openLocator('materiality')}
                railRef={materialityRailRef}
              />
            ) : null}
          </main>
        </section>
      ) : null}
    </div>
  );
}

function AdminPage() {
  const { revision, state, transport, setState } = useSharedWizardState();

  const applyPreset = (nextState: WizardState) => {
    void setState(nextState);
  };

  const setViewMode = (viewMode: ViewMode) => {
    void setState((currentState) => ({
      ...collapseLocatorState(currentState),
      screenMode: 'shelves',
      viewMode,
    }));
  };

  const toggleLocation = () => {
    void setState((currentState) => {
      if (currentState.selectionMode === 'locator') {
        return collapseLocatorState(currentState);
      }

      return {
        ...currentState,
        screenMode: 'shelves',
        locatorContext: currentState.viewMode,
        locatorReturnMode: currentState.selectionMode === 'single' ? 'single' : 'multi',
        selectionMode: 'locator',
      };
    });
  };

  const setActiveBook = (bookId: SelectedBookId) => {
    void setState((currentState) => {
      if (currentState.selectionMode === 'single') {
        return {
          ...currentState,
          activeSelectedBookId: bookId,
          selectedBookIds: [bookId],
        };
      }

      const selectedCount = Math.max(1, currentState.selectedBookIds.length);
      const nextSelectedBookIds = currentState.selectedBookIds.includes(bookId)
        ? currentState.selectedBookIds
        : [...currentState.selectedBookIds.slice(0, Math.max(0, selectedCount - 1)), bookId];

      return {
        ...currentState,
        activeSelectedBookId: bookId,
        selectedBookIds: nextSelectedBookIds,
      };
    });
  };

  return (
    <div className="admin-shell">
      <main className="admin-panel">
        <header className="admin-panel__header">
          <div>
            <p className="admin-panel__eyebrow">Wizard Of Oz Controller</p>
            <h1 className="admin-panel__title">Return Shelf Machine Admin</h1>
          </div>
          <div className={`admin-panel__status admin-panel__status--${transport}`}>
            <span>{transport === 'server' ? 'Live sync' : 'Local fallback'}</span>
            <span>rev {revision}</span>
          </div>
        </header>

        <section className="admin-card">
          <h2 className="admin-card__title">Screen State</h2>
          <div className="admin-button-grid">
            <button type="button" className="admin-button" onClick={() => applyPreset(createLandingState())}>
              Switch to default screen
            </button>
            <button
              type="button"
              className="admin-button"
              onClick={() => applyPreset(createSingleBookSelectedState(state.activeSelectedBookId))}
            >
              Switch to 1 book selected screen
            </button>
            <button
              type="button"
              className="admin-button"
              onClick={() => applyPreset(createTwoBookSelectedState('words'))}
            >
              Switch to 2 book selected screen
            </button>
            <button
              type="button"
              className="admin-button"
              onClick={() => applyPreset(createThreeBookSelectedState('words'))}
            >
              Switch to 3 book selected screen
            </button>
            <button
              type="button"
              className="admin-button"
              onClick={() => applyPreset(createFourBookSelectedState('words'))}
            >
              Switch to 4 book selected screen
            </button>
          </div>
        </section>

        <section className="admin-card">
          <h2 className="admin-card__title">Active Book</h2>
          <div className="admin-button-row">
            <button type="button" className="admin-button admin-button--small" onClick={() => setActiveBook('words')}>
              Words form language
            </button>
            <button
              type="button"
              className="admin-button admin-button--small"
              onClick={() => setActiveBook('cynophile')}
            >
              Brigade Cynophile
            </button>
            <button
              type="button"
              className="admin-button admin-button--small"
              onClick={() => setActiveBook('macguffin')}
            >
              MacGuffin
            </button>
            <button
              type="button"
              className="admin-button admin-button--small"
              onClick={() => setActiveBook('mind-walks')}
            >
              Mind Walks
            </button>
          </div>
        </section>

        <section className="admin-card">
          <h2 className="admin-card__title">Current Section</h2>
          <div className="admin-button-row">
            <button type="button" className="admin-button admin-button--small" onClick={() => setViewMode('base')}>
              Designer
            </button>
            <button
              type="button"
              className="admin-button admin-button--small"
              onClick={() => setViewMode('returned')}
            >
              Returned with
            </button>
            <button
              type="button"
              className="admin-button admin-button--small"
              onClick={() => setViewMode('materiality')}
            >
              Materiality
            </button>
            <button type="button" className="admin-button admin-button--small" onClick={toggleLocation}>
              {state.selectionMode === 'locator' ? 'Hide library location' : 'Show library location'}
            </button>
          </div>
        </section>

        <section className="admin-card">
          <h2 className="admin-card__title">Live State</h2>
          <dl className="admin-state-list">
            <div>
              <dt>Screen</dt>
              <dd>{state.screenMode}</dd>
            </div>
            <div>
              <dt>Selection</dt>
              <dd>{state.selectionMode}</dd>
            </div>
            <div>
              <dt>Books</dt>
              <dd>{state.selectedBookIds.join(', ')}</dd>
            </div>
            <div>
              <dt>Section</dt>
              <dd>{state.viewMode}</dd>
            </div>
            <div>
              <dt>Active Book</dt>
              <dd>{state.activeSelectedBookId}</dd>
            </div>
          </dl>
          <a className="admin-link" href="/">
            Open display screen
          </a>
        </section>
      </main>
    </div>
  );
}

function App() {
  const pathname = typeof window !== 'undefined' ? window.location.pathname.replace(/\/+$/, '') || '/' : '/';

  return pathname === '/admin' ? <AdminPage /> : <DisplayApp />;
}

export default App;
