export type PaginationMeta = {
  page: number
  pageSize: number
  total: number
  totalPages: number
}

export type TApiResponse<TData, TMeta = Record<string, unknown>> = {
  data: TData
  meta?: TMeta
}

export type ErrorResponse = {
  error: string
  details?: unknown
}
