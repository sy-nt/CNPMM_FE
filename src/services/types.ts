export type ApiResponse<TData> = {
  data: TData
  message: string
  statusCode: number
}

export type ApiErrorBody = {
  message?: string
}
