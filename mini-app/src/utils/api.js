import axios from 'axios';
import { WebApp } from '@telegram-web-app/core';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true
});

api.interceptors.request.use(config => {
  const token = localStorage.getItem('jwt');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  config.headers['X-XSRF-TOKEN'] = getCookie('XSRF-TOKEN');
  return config;
});

export const completeTask = async (taskId) => {
  try {
    const response = await api.post(`/tasks/${taskId}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Task failed');
  }
};