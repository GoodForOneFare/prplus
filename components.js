function getComponents() {
    const elements = document.querySelectorAll(
      [
        '.js-file .file-header[data-path*="/components/"]',
        '.js-file .file-header[data-path^="/app/steps/"]',
        '.js-file .file-header[data-path^="/app/foundation/"]',
      ].join(','),
    );

    const componentNames = Array.from(elements)
      .map((element) => getComponentNameFromPath(element))
      .filter(Boolean);

    return Array.from(new Set(componentNames.sort()));
  }

  function getComponentNameFromPath(element) {
    const path = element.dataset.path;
    if (
      path.match(/[/]components[/]/) ||
      path.match(/app[/]foundation[/]/) ||
      path.match(/app[/]steps[/]/)
    ) {
      // Remove "before the component's dir name" segments
      const relativeComponentPath = path.replace(
        /.*(foundation|steps|components)[/](.+)/,
        '$2',
      );
      const componentName = relativeComponentPath.split('/')[0];
      // Anything that doesn't start with a capital letter is an index.ts file, or something not component-related.
      const isComponent = componentName.match(/^[A-Z]/);
      if (isComponent) {
        return componentName;
      }
    }
    return false;
  }

  function focusComponent(componentName) {
    const elements = document.querySelectorAll(
      ['.js-file .file-header'].join(','),
    );

    Array.from(elements).forEach((element) => {
      if (getComponentNameFromPath(element) === componentName) {
        element.closest('.js-file').style.display = '';
      } else {
        element.closest('.js-file').style.display = 'none';
      }
    });
  }

  function hideComponent(componentName) {
    const elements = document.querySelectorAll(
      ['.js-file .file-header'].join(','),
    );

    Array.from(elements).forEach((element) => {
      if (getComponentNameFromPath(element) === componentName) {
        element.closest('.js-file').style.display = 'none';
      }
    });
  }

  function collapseComponent(componentName) {
    const elements = document.querySelectorAll(
      ['.js-file .file-header'].join(','),
    );

    Array.from(elements).forEach((element) => {
      if (getComponentNameFromPath(element) === componentName) {
        const expandButton = element.querySelector(
          '.file-info button[aria-expanded=true]',
        );
        if (expandButton) {
          expandButton.click();
        }
      }
    });
  }

  function expandComponent(componentName) {
    const elements = document.querySelectorAll(
      ['.js-file .file-header'].join(','),
    );

    Array.from(elements).forEach((element) => {
      if (getComponentNameFromPath(element) === componentName) {
        const expandButton = element.querySelector(
          '.file-info button[aria-expanded=false]',
        );
        if (expandButton) {
          expandButton.click();
        }
      }
    });
  }
