import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import bcrypt from 'bcryptjs';
import { AuthState, LoginCredentials, RegisterData, User } from '../types/auth';
import { sendWhatsAppMessage } from '../services/whatsapp';
import { createUser, findUserByEmail, updateUser } from '../services/auth';

interface AuthStore extends AuthState {
  login: (credentials: LoginCredentials) => Promise<{ success: boolean; error?: string }>;
  register: (data: RegisterData) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateUser: (userId: string, data: Partial<User>) => Promise<{ success: boolean; error?: string }>;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      login: async (credentials) => {
        try {
          const user = await findUserByEmail(credentials.email);

          if (!user) {
            return { success: false, error: 'Usuário não encontrado' };
          }

          if (!bcrypt.compareSync(credentials.password, user.password)) {
            return { success: false, error: 'Senha incorreta' };
          }

          if (user.status !== 'active') {
            return { success: false, error: 'Usuário não está ativo' };
          }

          set({ user, isAuthenticated: true, token: 'dummy-token' });
          return { success: true };
        } catch (error) {
          console.error('Login error:', error);
          return { success: false, error: 'Erro ao fazer login' };
        }
      },

      register: async (data) => {
        try {
          const existingUser = await findUserByEmail(data.email);

          if (existingUser) {
            return { success: false, error: 'Email já cadastrado' };
          }

          const hashedPassword = bcrypt.hashSync(data.password, 10);
          const result = await createUser({
            name: data.name,
            email: data.email,
            password: hashedPassword,
            role: 'user',
            status: 'pending'
          });

          if (!result.success) {
            return { success: false, error: result.error || 'Erro ao criar usuário' };
          }

          return { success: true };
        } catch (error) {
          console.error('Registration error:', error);
          return { success: false, error: 'Erro ao registrar usuário' };
        }
      },

      logout: () => {
        set({ user: null, token: null, isAuthenticated: false });
      },

      updateUser: async (userId, data) => {
        try {
          if (data.email) {
            const existingUser = await findUserByEmail(data.email);
            if (existingUser && existingUser.id !== userId) {
              return { success: false, error: 'Email já está em uso' };
            }
          }

          const result = await updateUser(userId, data);
          
          if (result.success) {
            set(state => ({
              user: state.user?.id === userId ? { ...state.user, ...data } : state.user
            }));
          }

          return result;
        } catch (error) {
          console.error('Update user error:', error);
          return { success: false, error: 'Erro ao atualizar usuário' };
        }
      }
    }),
    {
      name: 'auth-storage',
    }
  )
);