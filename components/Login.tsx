'use client'

import { account, databases } from '@/app/(root)/appwrite';
import { Query } from 'appwrite';
import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import bcryptjs from 'bcryptjs'
import { useRouter } from 'next/navigation';
import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from './ui/input-otp';
import Swal from 'sweetalert2';

type Inputs = {
  email: string;
  password: string
}



const Login = () => {
  const { register, handleSubmit, formState: { isSubmitting, errors } } = useForm<Inputs>();
  const [err, setErr] = useState<string>('');
  const [userId, setUserId] = useState<string | null>(null);
  const [verification, setVerification] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false)
  const router = useRouter()

  //form submit

  async function submit(data: Inputs) {

    try {
      const { email, password } = data;

      const user = await databases.listDocuments(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_URL!,
        process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_USER!,
        [
          Query.equal('email', email)
        ]
      );

      if (user.documents[0]) {
        const isRightPassword = await bcryptjs.compare(password, user.documents[0].password);

        if (isRightPassword) {
          const res = await account.createEmailToken('unique()', email)
          console.log(res);
          setUserId(res.userId)
          setVerification(true)

        } else {
          setErr('Your password is Wrong')
        }

      } else {
        setErr('User not Registered')
      }



    } catch (err: any) {
      console.error(err);
      setErr(err.message)
    }

  }

  // verify and session create

  async function verifyUser(otp: string, userId: string | null) {
    try {
      if (!userId || otp.length !== 6) {
        return Swal.fire("Something went wrong with your OTP");
      }
      setLoading(true);

      try {
        const session = await account.getSession("current");

        if (session) {
          console.log("Updating existing session...");
          await account.updateSession("current");
        }
      } catch (err) {
        console.log("No active session, creating a new one...", err);
        await account.createSession(userId, otp);
      }

      router.push("/");
    } catch (err) {
      console.error("Verification error:", err);
      Swal.fire("Failed to verify user");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(submit)} className='flex flex-col gap-4 text-black'>
      {errors && <p>{errors.root?.message}</p>}
      {err && <p className='text-red-500 m-auto'>{err}</p>}
      <input
        {...register("email", {
          required: true,
          pattern: {
            value: /^[\w.-]+@[a-zA-Z\d.-]+\.[a-zA-Z]{2,}$/,
            message: "Invalid email address",
          },
        })}
        disabled={verification}
        type="email"
        placeholder="E-Mail"
        className="outline-none py-2 px-3 rounded-2xl"
      />
      <input
        {...register("password", {
          required: true,
          minLength: {
            value: 8,
            message: "Password must be at least 6 characters long",
          },
        })}
        disabled={verification}
        type="password"
        placeholder="Password"
        className="outline-none py-2 px-3 rounded-2xl"
      />
      {!verification ? <div className='flex items-center justify-evenly'>
        <button type='reset' className="relative inline-flex h-12 overflow-hidden rounded-full p-[1px] focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-50">
          <span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#E2CBFF_0%,#393BB2_50%,#E2CBFF_100%)]" />
          <span className="inline-flex h-full w-full cursor-pointer items-center justify-center rounded-full bg-slate-950 px-3 py-1 text-sm font-medium text-white backdrop-blur-3xl">
            Reset
          </span>
        </button>
        <button type='submit' className="px-8 py-2 rounded-md bg-teal-500 text-white font-bold transition duration-200 hover:bg-white hover:text-black border-2 border-transparent hover:border-teal-500">
          {isSubmitting ? 'Submitting' : 'Submit'}
        </button>
      </div>
        : <InputOTP maxLength={6} onComplete={(otp) => verifyUser(otp, userId)} disabled={loading}>
          <InputOTPGroup className='bg-slate-600 rounded text-white font-bold m-auto' >
            <InputOTPSlot index={0} />
            <InputOTPSlot index={1} />
            <InputOTPSlot index={2} />
          </InputOTPGroup>
          <InputOTPSeparator />
          <InputOTPGroup className='bg-slate-600 rounded text-white font-bold m-auto'>
            <InputOTPSlot index={3} />
            <InputOTPSlot index={4} />
            <InputOTPSlot index={5} />
          </InputOTPGroup>
        </InputOTP>}
    </form>
  )
}

export default Login