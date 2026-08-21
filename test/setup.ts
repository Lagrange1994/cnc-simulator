import '@testing-library/jest-dom/vitest';

// jsdom doesn't implement scrollIntoView (every real browser does) -- stub it
// so components that call it (e.g. Editor.tsx's Find/Goto highlight) don't
// throw "scrollIntoView is not a function" under test.
if (!Element.prototype.scrollIntoView) {
  Element.prototype.scrollIntoView = () => {};
}
