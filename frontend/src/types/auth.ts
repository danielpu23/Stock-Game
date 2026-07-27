export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  id: number;
  username: string;
}

export interface RegisterResponse {
  id: number;
  username: string;
  email: string;
}

export interface User {
  id: number;
  username: string;
}