'use client'

import { databases } from '@/app/(root)/appwrite';
import { zodResolver } from '@hookform/resolvers/zod';
import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import bcryptjs from 'bcryptjs'
import Swal from 'sweetalert2'
import { Query } from 'appwrite';
import { useTheme } from 'next-themes';


const Signupschema = z.object({
  fullName: z.string().min(3, { message: "FullName must be at least 3 characters long" }),

  email: z.string().email({ message: "Invalid email address" }),

  dob: z.coerce.date().refine((date) => date <= new Date(), {
    message: "Date of birth must be in the past",
  }),


  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters long" })
    .regex(/[A-Z]/, { message: "Password must contain at least one uppercase letter" })
    .regex(/[a-z]/, { message: "Password must contain at least one lowercase letter" })
    .regex(/\d/, { message: "Password must contain at least one number" })
    .regex(/[@$!%*?&]/, { message: "Password must contain at least one special character" }),

  confirmPassword: z.string(),
})
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type SignupschemaInputs = z.infer<typeof Signupschema>



const Signup = () => {

  const { handleSubmit, register, formState: { isSubmitting, errors } } = useForm({ resolver: zodResolver(Signupschema) });
  const [userName, setUserName] = useState<string | null>(null)
  const [err, setErr] = useState<string | null>(null);
  const { theme } = useTheme()

  async function onSubmit(data: SignupschemaInputs) {

    try {
      const { fullName, email, dob, password, confirmPassword } = data;

      if (password !== confirmPassword) {
        return Swal.fire('Passwords do not match')
      }

      const user = await databases.listDocuments(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_URL!,
        process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_USER!,
        [
          Query.equal('email', email)
        ]
      );

      if (user.total > 0) {
        Swal.fire('User is already registered with this email')
        return
      }

      const salt = await bcryptjs.genSalt(10);
      const hashedPassword = await bcryptjs.hash(password, salt);

      await databases.createDocument(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_URL!,
        process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_USER!,
        'unique()',
        { fullName, dob, email, password: hashedPassword, userName }
      )

      window.location.reload()
    } catch (Err) {
      console.error(Err);

    }



  }

  async function onChangeUserName(e: React.ChangeEvent<HTMLInputElement>) {
    const { value } = e.target
    setUserName(value)
    try {
      setErr('')
      if (userName) {
        const user = await databases.listDocuments(
          process.env.NEXT_PUBLIC_APPWRITE_DATABASE_URL!,
          process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_USER!,
          [
            Query.equal('userName', value)
          ]
        )

        if (user.total !== 0) {
          setErr('username is already registered')
        }
      }
    } catch (err) {
      console.error(err);

      setErr('This UserName creates problem')
    }
  }


  return (
    <form className={`flex flex-col gap-4 ${theme === 'dark' ? 'text-white' : 'text-black'}`} onSubmit={handleSubmit(onSubmit)}>

      <input disabled={isSubmitting} {...register('fullName')} type='text' placeholder='Full Name' className='outline-none py-2 px-3 rounded-2xl' required />
      {errors.fullName?.message && <p className='text-sm text-red-600 my-2'> {errors.fullName?.message}</p>}
      <input disabled={isSubmitting} onChange={onChangeUserName} type='text' placeholder='userName' className='outline-none py-2 px-3 rounded-2xl' required />
      {err && <p className='text-sm text-red-600 my-2'> {err}</p>}
      <input disabled={isSubmitting} {...register('dob')} type='date' placeholder='dd/mm/yyyy' className='outline-none py-2 px-3 rounded-2xl' required />
      {errors.dob?.message && <p className='text-sm text-red-600 my-2'> {errors.dob?.message}</p>}
      <input disabled={isSubmitting} {...register('email')} type='email' placeholder='E-Mail' className='outline-none py-2 px-3 rounded-2xl' required />
      {errors.email?.message && <p className='text-sm text-red-600 my-2'> {errors.email?.message}</p>}
      <input disabled={isSubmitting} {...register('password')} type='password' placeholder='Password' className='outline-none py-2 px-3 rounded-2xl' required />
      {errors.password?.message && <p className='text-sm text-red-600 my-2'> {errors.password?.message}</p>}
      <input disabled={isSubmitting} {...register('confirmPassword')} type='password' placeholder='Confirm Password' className='outline-none py-2 px-3 rounded-2xl' required />
      {errors.confirmPassword?.message && <p className='text-sm text-red-600 my-2'> {errors.confirmPassword?.message}</p>}



      <div className='flex items-center justify-evenly'>
        <button type='reset' className="relative inline-flex h-10 overflow-hidden rounded-full p-[1px] focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-50">
          <span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#E2CBFF_0%,#393BB2_50%,#E2CBFF_100%)]" />
          <span className="inline-flex h-full w-full cursor-pointer items-center justify-center rounded-full bg-slate-950 px-3 py-1 text-sm font-medium text-white backdrop-blur-3xl">
            Reset
          </span>
        </button>
        <button type='submit' className="px-8 py-2 rounded-md bg-teal-500 text-white font-bold transition duration-200 hover:bg-white hover:text-black border-2 border-transparent hover:border-teal-500">
          {isSubmitting ? 'Submitting' : 'Submit'}
        </button>
      </div>
    </form>
  )
}

export default Signup