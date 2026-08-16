import { useAuthStore } from '../store/authStore';
import { authApi } from '../services/auth.api';
import { connectSocket, disconnectSocket } from '../services/socket.service';

/** Hook exposing all auth actions used by pages and components */
export const useAuth = () => {
  const { user, isAuthenticated, setUser, logout: clearStore } = useAuthStore();

  const login = async (email: string, password: string) => {
    const { data } = await authApi.login({ email, password });
    setUser(data.data.user);
    connectSocket(); // Open socket after successful auth
  };

  const register = async (name: string, email: string, password: string) => {
    const { data } = await authApi.register({ name, email, password });
    setUser(data.data.user);
    connectSocket();
  };

  const logout = async () => {
    await authApi.logout();
    clearStore();
    disconnectSocket();
  };

  return { user, isAuthenticated, login, register, logout };
};
