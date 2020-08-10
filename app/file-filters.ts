import {Command, FileType, FileFilter} from './types';

export const fileFilters: Record<FileType, FileFilter> = {
  css: {
    filter: (file) => /[.]css$/.test(file.path),
    text: 'CSS',
  },
  data: {
    filter: (file) => /[.](json|yml)?$/.test(file.path),
    text: 'Data',
  },
  deleted: {
    filter: (file) => file.isDeleted,
    text: 'deleted',
  },
  graphql: {
    filter: (file) => /[.](graphql|gql)$/.test(file.path),
    text: 'GraphQL',
  },
  image: {
    filter: (file) => /[.](gif|jpe?g|png|svg)?$/.test(file.path),
    text: 'image',
  },
  javascript: {
    filter: (file) => /\.jsx?$/.test(file.path),
    text: 'JavaScript',
  },
  typescript: {
    filter: (file) => /\.tsx?$/.test(file.path),
    text: 'TypeScript',
  },
  json: {
    filter: (file) => file.path.endsWith('.json'),
    text: 'JSON',
  },
  renamed: {
    filter: (file) => file.isRenamed,
    text: 'renamed',
  },
  sass: {
    filter: (file) => /[.]scss$/.test(file.path),
    text: 'Sass',
  },
  style: {
    filter: (file) => /[.]s?css$/.test(file.path),
    text: 'style',
  },
  svg: {
    filter: (file) => file.path.endsWith('.svg'),
    text: 'SVG',
  },
  test: {
    filter: (file) =>
      /\.test\.[jt]sx?$/.test(file.path) ||
      /[/]tests?[/]/.test(file.path) ||
      /_tests?\.rb/.test(file.path),
    text: 'test',
  },
  viewed: {
    filter: (file) => file.isViewed,
    text: 'viewed',
  },
  yml: {
    filter: (file) => /[.]yml?$/.test(file.path),
    text: 'YML',
  },
};

export const filterNames: Record<FileType, Command['text']> = {
  css: 'CSS',
  data: 'data',
  deleted: 'deleted',
  graphql: 'GraphQL',
  image: 'image',
  javascript: 'JavaScript',
  typescript: 'TypeScript',
  json: 'JSON',
  renamed: 'renamed',
  sass: 'Sass',
  style: 'style',
  svg: 'SVG',
  test: 'test',
  viewed: 'viewed',
  yml: 'YML',
};
