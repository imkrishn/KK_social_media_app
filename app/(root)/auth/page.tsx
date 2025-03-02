'use client'

import Login from '@/components/Login'
import Signup from '@/components/Signup';
import { TextGenerateEffect } from '@/components/ui/Text-generate-Effect';
import Image from 'next/image';
import React, { useEffect, useState } from 'react'
import logo from '@/public/images/kk.png'
import { motion, AnimatePresence } from "framer-motion";
import { account } from '../appwrite';
import { useRouter } from 'next/navigation';




type Auth = 'Login' | 'Signup';

const Auth = () => {
  const [authType, setAuthType] = useState<Auth>('Login');
  const router = useRouter()

  useEffect(() => {
    const getAuthUser = async () => {
      try {
        const session = await account.getSession('current');

        if (session) {
          router.push("/index");
        }
      } catch (err) {
        console.log("Error fetching user:", err);

      }
    };

    getAuthUser();
  }, [router]);

  return (
    <div className="h-screen w-full dark:bg-black bg-white  dark:bg-grid-white/[0.2] bg-grid-black/[0.2] relative flex items-center justify-center">
      <div className="absolute pointer-events-none inset-0 flex items-center justify-center dark:bg-black bg-black [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]"></div>
      <div className='p-4'>
        <Image src={logo} className='m-auto opacity-55 w-1/2 rounded-full' alt='#' />
        <TextGenerateEffect words='Connect, share, and engage—your world, your network!' className='text-4xl m-auto w-max my-4' duration={5} />


      </div>
      <div className='border rounded-lg p-6 h-max w-1/3 shadow-2xl z-10 m-11 '>
        <div className='flex gap-11 p-2 justify-center text-2xl font-bold select-none my-4 '>
          <p onClick={() => setAuthType('Login')} className={`cursor-pointer active:scale-95 ${authType === 'Login' && 'text-blue-600'}`}>Login</p>
          <p onClick={() => setAuthType('Signup')} className={`cursor-pointer active:scale-95 ${authType === 'Signup' && 'text-blue-600'}`}>Signup</p>
        </div>

        <AnimatePresence mode="wait">
          {authType === "Login" && (
            <motion.div
              key="login"
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              transition={{ duration: 1 }}
            >
              <Login />
            </motion.div>
          )}

          {authType === "Signup" && (
            <motion.div
              key="signup"
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              transition={{ duration: 1 }}
            >
              <Signup />
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  )
}

export default Auth