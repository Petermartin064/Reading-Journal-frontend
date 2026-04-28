const API_BASE_URL = 'http://localhost:8000/api';

export const fetchClient = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const config = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    // Required to send and receive HttpOnly cookies
    credentials: 'include',
  };

  let response = await fetch(url, config);

  if (response.status === 401 && !options._retry && !endpoint.includes('/auth/login') && !endpoint.includes('/auth/register')) {
    options._retry = true;
    try {
      // Attempt to refresh token
      const refreshResponse = await fetch(`${API_BASE_URL}/auth/refresh/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });

      if (refreshResponse.ok) {
        // Retry the original request
        return await fetch(url, config);
      } else {
        // Refresh failed, user needs to login again
        return Promise.reject(new Error('Session expired'));
      }
    } catch (err) {
      return Promise.reject(err);
    }
  }

  let data;
  try {
    data = await response.json();
  } catch (e) {
    if (!response.ok) return Promise.reject(new Error('Server error'));
    return null;
  }
  
  if (!response.ok) {
    return Promise.reject(data);
  }

  return data;
};
