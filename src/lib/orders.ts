const DEFAULT_API_BASE = 'http://localhost:4000';
const normalizeBase = (value: string | undefined | null) => {
  if (value === undefined || value === null) return null;
  const normalized = value === '/' ? '' : value;
  if (!normalized) return normalized;
  return normalized.endsWith('/') ? normalized.slice(0, -1) : normalized;
};

const API_BASE = normalizeBase(import.meta.env?.VITE_API_URL) ?? DEFAULT_API_BASE;

export interface OrderItemInput {
  productId: string;
  quantity: number;
  price: number | string;
}

export interface CreateOrderPayload {
  customerName: string;
  status?: string;
  userId?: string;
  items: OrderItemInput[];
}

export interface OrderResponse {
  id: string;
  customerName: string;
  status: string;
  total: string;
  createdAt: string;
  items: Array<{
    id: string;
    quantity: number;
    price: string;
    product?: {
      id: string;
      name: string;
      sku: string;
    };
  }>;
}

const getStoredToken = () => {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem('aztekaAuth');
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed?.token ?? null;
  } catch {
    return null;
  }
};

const withAuthHeaders = (headers: HeadersInit = {}) => {
  const token = getStoredToken();
  return token
    ? {
        ...headers,
        Authorization: `Bearer ${token}`,
      }
    : headers;
};

const handleResponse = async <T>(res: Response): Promise<T> => {
  let body: unknown = null;
  const text = await res.text();

  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = text;
  }

  if (!res.ok) {
    const message =
      typeof body === 'object' && body && 'message' in body
        ? (body as Record<string, string>).message
        : `Request failed with status ${res.status}`;
    throw new Error(message);
  }

  return body as T;
};

export const OrdersService = {
  async fetchOrders(): Promise<OrderResponse[]> {
    const res = await fetch(`${API_BASE}/api/orders`, {
      method: 'GET',
      headers: withAuthHeaders({
        Accept: 'application/json',
      }),
    });
    return handleResponse<OrderResponse[]>(res);
  },

  async createOrder(payload: CreateOrderPayload): Promise<OrderResponse> {
    const res = await fetch(`${API_BASE}/api/orders`, {
      method: 'POST',
      headers: withAuthHeaders({
        'Content-Type': 'application/json',
        Accept: 'application/json',
      }),
      body: JSON.stringify(payload),
    });
    return handleResponse<OrderResponse>(res);
  },
};

export default OrdersService;
