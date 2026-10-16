import { CreateUserSchema, LoginSchema, ProfileResponseSchema, UserResponseSchema, CatalogPageSchema, CardDetailSchema, type CreateUser, HomeResponseSchema, type HomeResponse, type Lens } from '@op-alpha/contracts';
import { Platform } from 'react-native';
import { HoldingInputSchema, HoldingResponseSchema, type HoldingInput } from '@op-alpha/contracts';
const LOCAL_API = Platform.OS === 'android' ? 'http://10.0.2.2:3333/v1' : 'http://localhost:3333/v1';
const API_URL = process.env.EXPO_PUBLIC_API_URL ?? LOCAL_API;
export async function getHome(lens: Lens, limit = 6, signal?: AbortSignal): Promise<HomeResponse> {
  const response = await fetch(`${API_URL}/home?lens=${lens}&limit=${limit}`, { signal });
  if (!response.ok) throw await apiError(response);
  return HomeResponseSchema.parse(await response.json());
}

export async function getCards(input: { query?: string; set?: string; language?: 'EN' | 'JP' | 'PT'; page: number; limit: number }, signal?: AbortSignal) {
  const params = new URLSearchParams({ page: String(input.page), limit: String(input.limit) });
  if (input.query) params.set('query', input.query);
  if (input.set) params.set('set', input.set);
  if (input.language) params.set('language', input.language);
  const response = await fetch(`${API_URL}/cards?${params}`, { signal });
  if (!response.ok) throw await apiError(response);
  return CatalogPageSchema.parse(await response.json());
}

export async function getCard(id: string, signal?: AbortSignal) {
  const response = await fetch(`${API_URL}/cards/${encodeURIComponent(id)}`, { signal });
  if (!response.ok) throw await apiError(response);
  return CardDetailSchema.parse(await response.json());
}

export class ApiError extends Error {
  constructor(public readonly status: number, message: string) { super(message); }
}
async function apiError(response: Response): Promise<ApiError> {
  const body = await response.json().catch(() => null);
  const message = body?.message;
  return new ApiError(response.status, Array.isArray(message) ? message.join('\n') : typeof message === 'string' ? message : 'Não foi possível concluir a solicitação.');
}
async function accountRequest(path: string, method = 'GET', body?: unknown, signal?: AbortSignal) {
  const response = await fetch(`${API_URL}${path}`, {
    method, credentials: 'include', signal,
    headers: { 'X-Op-Client': '1', ...(body === undefined ? {} : { 'Content-Type': 'application/json' }) },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  }).catch((error) => {
    if (error?.name === 'AbortError') throw error;
    throw new Error('Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.');
  });
  if (!response.ok) throw await apiError(response);
  return response.json();
}
export async function getSession(signal?: AbortSignal) {
  try { return UserResponseSchema.parse(await accountRequest('/auth/me', 'GET', undefined, signal)); }
  catch (error) { if (error instanceof ApiError && error.status === 401) return null; throw error; }
}
export async function login(email: string, password: string) {
  await accountRequest('/auth/login', 'POST', LoginSchema.parse({ email, password }));
}
export async function logout() { await accountRequest('/auth/logout', 'POST'); }
export async function addHolding(input: HoldingInput) {
  return HoldingResponseSchema.parse(await accountRequest('/users/me/holdings', 'POST', HoldingInputSchema.parse(input)));
}
export async function getProfile(signal?: AbortSignal) {
  return ProfileResponseSchema.parse(await accountRequest('/users/me/profile', 'GET', undefined, signal));
}
export async function createUser(input: CreateUser) {
  const response = await fetch(`${API_URL}/users`, {
    method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Op-Client': '1' },
    body: JSON.stringify(CreateUserSchema.parse(input)),
  }).catch(() => {
    throw new Error('Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.');
  });
  if (!response.ok) throw await apiError(response);
  return UserResponseSchema.parse(await response.json());
}
