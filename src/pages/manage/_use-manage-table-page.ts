import { useCallback, useState } from 'react'

type ManageTablePageState = {
  page: number
  setPage: (page: number) => void
  resetPage: () => void
}

export function useManageTablePage(): ManageTablePageState {
  const [page, setPageState] = useState(1)

  const setPage = useCallback((next: number): void => {
    setPageState(Math.max(1, next))
  }, [])

  const resetPage = useCallback((): void => {
    setPageState(1)
  }, [])

  return { page, setPage, resetPage }
}
