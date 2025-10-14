'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axiosSuperAdmin from '@/axiosInstances/axiosSuperAdmin';
import { useDispatch, useSelector } from 'react-redux';
import { logoutUser, setAdmin } from '@/redux/userSlice';
import axiosGlobal from '@/axiosInstances/axiosGlobal';
import { useAuth } from '@/contexts/AuthContext';


interface Props {
  children: React.ReactNode;
}

export default function AuthGuard({ children }: Props) {
  
  const router = useRouter();
  const dispatch = useDispatch();
  const userGlobal = useSelector((state: any) => state.user);
  const user = userGlobal?.user;
  const { checking, setChecking } = useAuth();

  const handleLogout = async () => {
    try {
      
      const res = await axiosGlobal.post('/auth/logout');
      if (res.status === 200) {
        dispatch(logoutUser());
        router.push('/login');
      }else{
        alert('Logout failed');
        console.error('Logout failed:', res.data.message);

      }

    } catch (error) {
      console.error('Logout failed:', error);
      
    }

  };

  useEffect(() => {
    
    const checkAuth = async () => {
      if (user?.isAuthenticated) {
        setChecking(false);
        
        return;
      }

      try {
        const res = await axiosSuperAdmin.get('/info/getAdminInfo', {
          withCredentials: true,
        });
        console.log('Auth check response:', res);
        if (res.status === 200 && res.data.success) {
            const userData = res.data.data.superAdminDTO;


          dispatch(setAdmin(userData));
        } else {
          console.log('User not authenticated, redirecting to login');
          handleLogout();
        }
      } catch (err) {
        console.log('User not authenticated, redirecting to login');
        handleLogout();
      } finally {
        setChecking(false);
        console.log('Auth check completed');
      }
    };

    checkAuth();
  }, []);

  if (checking) {
    // You can return a spinner here if you want
    return null;
  }

  return <>{children}</>;
}
