export type ShelfTab = 'Designer' | 'Omnigroup';
export type ViewMode = 'base' | 'returned' | 'materiality';
export type ScreenMode = 'landing' | 'shelves';
export type SelectionMode = 'single' | 'multi' | 'locator';
export type NonLocatorSelectionMode = Exclude<SelectionMode, 'locator'>;
export type LocatorContext = 'base' | 'returned' | 'materiality';

export type WizardState = {
  screenMode: ScreenMode;
  selectionMode: SelectionMode;
  locatorReturnMode: NonLocatorSelectionMode;
  locatorContext: LocatorContext;
  activeTab: ShelfTab;
  activeSelectedBookId: string;
  selectedBookIds: string[];
  viewMode: ViewMode;
};

export type WizardEnvelope = {
  revision: number;
  state: WizardState;
};

export const ALL_BOOK_IDS = ['cynophile', 'macguffin', 'mind-walks', 'words'] as const;
export const TWO_BOOK_IDS = ['cynophile', 'words'] as const;
export const THREE_BOOK_IDS = ['cynophile', 'macguffin', 'words'] as const;

export const DEFAULT_WIZARD_STATE: WizardState = {
  screenMode: 'landing',
  selectionMode: 'multi',
  locatorReturnMode: 'multi',
  locatorContext: 'base',
  activeTab: 'Designer',
  activeSelectedBookId: 'words',
  selectedBookIds: [...ALL_BOOK_IDS],
  viewMode: 'base',
};

export const DEFAULT_WIZARD_ENVELOPE: WizardEnvelope = {
  revision: 0,
  state: DEFAULT_WIZARD_STATE,
};

export function normalizeWizardState(candidate: WizardState): WizardState {
  const dedupedBookIds = candidate.selectedBookIds.filter(
    (bookId, index, ids) => ALL_BOOK_IDS.includes(bookId as (typeof ALL_BOOK_IDS)[number]) && ids.indexOf(bookId) === index,
  );
  const selectedBookIds = dedupedBookIds.length > 0 ? dedupedBookIds : [...ALL_BOOK_IDS];
  const activeSelectedBookId = selectedBookIds.includes(candidate.activeSelectedBookId)
    ? candidate.activeSelectedBookId
    : selectedBookIds[selectedBookIds.length - 1] ?? 'words';

  return {
    ...DEFAULT_WIZARD_STATE,
    ...candidate,
    activeSelectedBookId,
    selectedBookIds,
    locatorReturnMode:
      candidate.locatorReturnMode === 'single' || candidate.locatorReturnMode === 'multi'
        ? candidate.locatorReturnMode
        : 'multi',
  };
}

export function createLandingState(): WizardState {
  return { ...DEFAULT_WIZARD_STATE };
}

export function createSingleBookSelectedState(bookId = 'words'): WizardState {
  return normalizeWizardState({
    ...DEFAULT_WIZARD_STATE,
    screenMode: 'shelves',
    selectionMode: 'single',
    locatorReturnMode: 'single',
    activeSelectedBookId: bookId,
    selectedBookIds: [bookId],
  });
}

export function createTwoBookSelectedState(activeBookId = 'words'): WizardState {
  return normalizeWizardState({
    ...DEFAULT_WIZARD_STATE,
    screenMode: 'shelves',
    selectionMode: 'multi',
    locatorReturnMode: 'multi',
    activeSelectedBookId: activeBookId,
    selectedBookIds: [...TWO_BOOK_IDS],
  });
}

export function createThreeBookSelectedState(activeBookId = 'words'): WizardState {
  return normalizeWizardState({
    ...DEFAULT_WIZARD_STATE,
    screenMode: 'shelves',
    selectionMode: 'multi',
    locatorReturnMode: 'multi',
    activeSelectedBookId: activeBookId,
    selectedBookIds: [...THREE_BOOK_IDS],
  });
}

export function createFourBookSelectedState(activeBookId = 'words'): WizardState {
  return normalizeWizardState({
    ...DEFAULT_WIZARD_STATE,
    screenMode: 'shelves',
    selectionMode: 'multi',
    locatorReturnMode: 'multi',
    activeSelectedBookId: activeBookId,
    selectedBookIds: [...ALL_BOOK_IDS],
  });
}
