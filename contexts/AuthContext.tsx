'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import axiosGlobal from '@/axiosInstances/axiosGlobal';
import axiosSuperAdmin from '@/axiosInstances/axiosSuperAdmin';
import { logoutUser, setAdmin } from '@/redux/userSlice'; // <-- Import your setUser action creator
import { encryptObject, importPublicKey } from '@/util/rsa';

interface User {
  id: number;
  email: string;
  name: string;
  role: 'admin' | 'super_admin';
}

interface AuthContextType {
  user: User | null;
  checking: boolean;
  login: (email: string, password: string) => Promise<void>;
  setChecking: (checking: boolean) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);



export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [checking, setChecking] = useState(true);
  const router = useRouter();
  const userGlobal = useSelector((state: any) => state.user);
  const admin = userGlobal?.user;
  const isAdminAuthenticated = userGlobal.isAuthenticated;
  const dispatch = useDispatch();

  useEffect(() => {
    
    checkAuth();

  }, []);

  const checkAuth = async() => {

      setChecking(true);
      console.log('Checking authentication status...');
      //check if user is logged in
      try {
        if(isAdminAuthenticated && admin) {
        setUser(admin);
      } else {
        
        const res = await axiosSuperAdmin.get('/info/getAdminInfo');
        if(!res.status || res.status !== 200) {
          logout();
          return;
        }
        const adminData = res.data.data;
       
        setUser({
          id: adminData.id,
          email: adminData.email,
          name: adminData.name,
          role: 'super_admin',
        });
        dispatch(setAdmin({ user: {
          id: adminData.id,
          email: adminData.email,
          name: adminData.name,
          role: 'super_admin',
        }}));
        
      }
      } catch (error) {
        console.error('Error fetching admin info:', error);

      }finally{
        setChecking(false);
        
      }
      
      
    }

  const login = async (email: string, password: string): Promise<void> => {
    
    try {
      //encrypt
      const pem = process.env.NEXT_PUBLIC_GLOBAL_PUBLIC_KEY!;
      const publicKey = await importPublicKey(pem);
      const obj = {
        email: email,
        password: password
      };
      const payload = await encryptObject(obj, publicKey);
      const res = await axiosGlobal.post('/auth/login', {payload});
      if (res.status === 200) {
        
        await checkAuth();
        router.push('/dashboard');
      } else {
        throw new Error('Login failed');
        console.error('Login failed:', res.statusText);
      }
    } catch (error) {
      throw error; // Rethrow the error to be handled in the component
      console.error('Login error:', error);
    }
    
    
  };

  const logout = async () => {
    try {
      
      const res = await axiosGlobal.post('/auth/logout');
      if (res.status === 200) {
        setUser(null);
        dispatch(logoutUser());
       
        router.push('/admin/login');
      }else{
        console.error('Logout failed:', res.statusText);
      }

    } catch (error) {
      console.error('Logout failed:', error);
      
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        checking,
        setChecking,
        login,
        logout,
        isAuthenticated: !!user
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}