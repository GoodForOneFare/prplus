function isFilesView() {
  return window.location.pathname.endsWith('/files');
}

export function tabsListener(
  tabChangeCallback: (isFilesView: boolean) => void,
) {
  const tabObserver = new MutationObserver(() => {
    tabChangeCallback(isFilesView());
  });

  tabObserver.observe(document.querySelector('main')!, {
    childList: true,
    subtree: false,
  });

  tabChangeCallback(isFilesView());
}
