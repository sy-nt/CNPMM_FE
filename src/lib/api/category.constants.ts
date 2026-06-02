import type {
  CategoryListQuery,
  CategoryTreeQuery,
} from '#/lib/api/category'

export const CATEGORY_PAGE_SIZE = 30

export const CATEGORY_TREE_DEPTH = 4

export const CATEGORY_MAX_ANCESTOR_DEPTH = 50

export const CATEGORY_LIST_DEFAULT_QUERY = {
  page: 1,
  limit: CATEGORY_PAGE_SIZE,
  sort: 'asc',
  orderBy: 'displayOrder',
} as const satisfies CategoryListQuery

export const CATEGORY_TREE_DEFAULT_QUERY = {
  depth: CATEGORY_TREE_DEPTH,
} as const satisfies CategoryTreeQuery
