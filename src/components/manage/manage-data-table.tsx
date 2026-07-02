import type { ReactNode } from 'react'

import { ManagePagination } from '#/components/manage/manage-pagination'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '#/components/ui/table'
import { cn } from '#/lib/utils'

export type ManageTableColumn<T> = {
  id: string
  header: string
  cell: (row: T) => ReactNode
  className?: string
}

export type ManageTablePagination = {
  page: number
  totalPage: number
  total?: number
  onPageChange: (page: number) => void
}

type ManageDataTableProps<T> = {
  columns: ReadonlyArray<ManageTableColumn<T>>
  rows: ReadonlyArray<T>
  getRowKey: (row: T) => string
  actions?: (row: T) => ReactNode
  actionsHeader?: string
  emptyMessage?: string
  className?: string
  onRowClick?: (row: T) => void
  pagination?: ManageTablePagination
}

export function ManageDataTable<T>({
  columns,
  rows,
  getRowKey,
  actions,
  actionsHeader = 'Actions',
  emptyMessage = 'No items found.',
  className,
  onRowClick,
  pagination,
}: ManageDataTableProps<T>): ReactNode {
  if (rows.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground">
        {emptyMessage}
      </p>
    )
  }

  return (
    <div className={cn('overflow-hidden rounded-lg border border-border', className)}>
      <Table>
        <TableHeader className="bg-muted/70">
          <TableRow className="border-border/80 hover:bg-muted/70">
            {columns.map((column) => (
              <TableHead
                key={column.id}
                className={cn(
                  'h-10 bg-muted/70 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground',
                  column.className,
                )}
              >
                {column.header}
              </TableHead>
            ))}
            {actions ? (
              <TableHead className="bg-muted/70 text-right text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                {actionsHeader}
              </TableHead>
            ) : null}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row, index) => (
            <TableRow
              key={getRowKey(row)}
              className={cn(
                index % 2 === 1 && 'bg-muted/25',
                onRowClick && 'cursor-pointer',
              )}
              onClick={
                onRowClick
                  ? () => {
                      onRowClick(row)
                    }
                  : undefined
              }
            >
              {columns.map((column) => (
                <TableCell key={column.id} className={column.className}>
                  {column.cell(row)}
                </TableCell>
              ))}
              {actions ? (
                <TableCell className="text-right">
                  <div
                    className="flex flex-wrap justify-end gap-2"
                    onClick={(event) => event.stopPropagation()}
                    onKeyDown={(event) => event.stopPropagation()}
                  >
                    {actions(row)}
                  </div>
                </TableCell>
              ) : null}
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {pagination ? (
        <div className="flex flex-col items-center justify-between gap-2 border-t border-border bg-muted/20 px-3 py-3 sm:flex-row">
          <p className="text-xs text-muted-foreground">
            Page {pagination.page} of {Math.max(1, pagination.totalPage)}
            {pagination.total !== undefined
              ? ` · ${pagination.total} item${pagination.total === 1 ? '' : 's'}`
              : ''}
          </p>
          {pagination.totalPage > 1 ? (
            <ManagePagination
              page={pagination.page}
              totalPage={pagination.totalPage}
              onPageChange={pagination.onPageChange}
            />
          ) : null}
        </div>
      ) : null}
    </div>
  )
}
