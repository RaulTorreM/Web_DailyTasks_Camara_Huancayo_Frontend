import { http } from './client';
import type { ChangePasswordRequest, DailyTaskUser, LoginResponse } from './types';

export const login = (username: string, password: string) =>
  http.post<LoginResponse>('/auth/login', { username, password });

export const me = () => http.get<DailyTaskUser>('/auth/me');

export const changePassword = (payload: ChangePasswordRequest) =>
  http.post<void>('/auth/change-password', payload);
