export const login = async (username: string, password: string) => {
  const response = await fetch(
    'http://localhost:8180/realms/datum-travels/protocol/openid-connect/token',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'password',
        client_id: 'datum-travels-backend',
        username,
        password,
      }),
    }
  );

  const data = await response.json();
  localStorage.setItem('access_token', data.access_token);
  return data.access_token;
};

// Interceptor HTTP (con axios)
import axios from 'axios';

export const api = axios.create({
  baseURL: 'http://localhost:8081/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});