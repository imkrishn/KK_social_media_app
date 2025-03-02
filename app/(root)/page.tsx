'use client'

import Create from "@/components/Create";
import Explore from "@/components/Explore";
import Home from "@/components/Home";
import Messages from "@/components/Messages";
import Navbar from "@/components/Navbar";
import Profile from "@/components/Profile";
import Settings from "@/components/Settings";
import SideBar from "@/components/SideBar";
import Spinner from "@/components/ui/Spinner";
import { useLoggedInUser } from "@/hooks/useLoggedInUser";
import { setLoggedInUser } from "@/redux/slices/loggedInUser";
import { AppDispatch } from "@/redux/store";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { account } from "./appwrite";



type Type = 'Home' | 'Explore' | 'Messages' | 'Create' | 'Profile' | ''


export default function Main() {
  const [interfaceType, setInterfaceType] = useState<Type>('');
  const [setting, setSetting] = useState<boolean>(false);
  const dispatch = useDispatch<AppDispatch>();
  const { fullName, dob, userName, imageUrl, $id, email } = useLoggedInUser();
  const router = useRouter()

  useEffect(() => {
    const getAuthUser = async () => {
      try {
        const session = await account.get();
        if (!session) {
          router.push("/auth");
        }
      } catch (err) {
        console.log("Error fetching user:", err);
        router.push("/auth");
      }
    };

    getAuthUser();
  }, []);

  useEffect(() => {
    setTimeout(() => {
      setInterfaceType('Profile')
    }, 3000)
  }, [])


  useEffect(() => {
    dispatch(setLoggedInUser({ fullName, dob, userName, imageUrl, $id, email }));
  }, [$id])

  return (
    <main className="lg:px-56 p-8 bg-opacity-35 lg:h-[485px]">
      <Navbar />
      {setting ? <Settings setSetting={setSetting} /> : <main className="flex lg:flex-row flex-col items-center justify-center gap-7 h-full">
        <SideBar setInterfaceType={setInterfaceType} setSetting={setSetting} />
        {interfaceType === 'Home' && <Home />}
        {interfaceType === 'Create' && <Create setInterfaceType={setInterfaceType} />}
        {interfaceType === 'Explore' && <Explore setInterfaceType={setInterfaceType} />}
        {interfaceType === 'Messages' && <Messages />}
        {interfaceType === '' && <div className="h-full w-[75%] bg-black rounded-xl flex items-center justify-center"><Spinner size={40} /></div>}
        {$id && interfaceType === 'Profile' && <Profile id={$id} setInterfaceType={setInterfaceType} />}
      </main>}
    </main>
  );
}
