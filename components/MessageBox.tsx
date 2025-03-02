'use client'

import { useTheme } from 'next-themes';
import Image from 'next/image'
import React, { useEffect, useRef, useState } from 'react';
import bg from '@/public/images/bg.jpg'
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { client, databases, storage } from '@/app/(root)/appwrite';
import MsgBox from './MsgBox';
import { Query } from 'appwrite';
import Spinner from './ui/Spinner';
import Swal from 'sweetalert2';
import { motion } from "framer-motion";

type User = {
  $id: string;
  fullName?: string;
  userName?: string;
  imageUrl?: string;
  dob?: string;

}

interface Msg {
  fileHref?: string;
  $id: string;
  $createdAt?: string;
  name?: string;
  mimeType?: string;
  content?: string;
  messageType?: 'text' | 'file';
  senderId?: string;
  recieverId?: string;
}

const MessageBox = ({ user }: { user: User | undefined }) => {
  const { theme } = useTheme();
  const [messages, setMessages] = useState<Msg[]>([]);
  const [currentMsg, setCurrentMsg] = useState<string>('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const recieverId = useSelector((state: RootState) => state.currentMsgUser.$id);
  const loggedInUserId = useSelector((state: RootState) => state.loggedInUser.$id)

  const scroll = () => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' })
  }


  useEffect(() => {

    async function fetchAllMessages() {
      try {
        setLoading(true)
        const sentMessages = await databases.listDocuments(
          process.env.NEXT_PUBLIC_APPWRITE_DATABASE_URL!,
          process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_MESSAGES!,
          [Query.equal('senderId', loggedInUserId), Query.equal('recieverId', recieverId!)]
        );

        const receivedMessages = await databases.listDocuments(
          process.env.NEXT_PUBLIC_APPWRITE_DATABASE_URL!,
          process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_MESSAGES!,
          [Query.equal('senderId', recieverId!), Query.equal('recieverId', loggedInUserId)]
        );

        const messages = [...sentMessages.documents, ...receivedMessages.documents].sort((a, b) =>
          new Date(a.$createdAt).getTime() - new Date(b.$createdAt).getTime()
        );


        const updatedMessages = await Promise.all(
          messages.map(async (message) => {
            if (message?.messageType === 'file') {
              const file = await storage.getFile(
                process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID!,
                message?.content
              );

              const fileHref = await storage.getFileView(
                process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID!,
                message?.content
              );

              const { mimeType, name } = file

              return { ...message, mimeType, name, fileHref };
            }
            return message;
          })
        );
        setMessages(updatedMessages)
        scroll()

      } catch (Err) {
        console.error(Err);
        return [];
      } finally {
        setLoading(false)
      }
    }


    if (recieverId && loggedInUserId) {
      fetchAllMessages()
    }
  }, [recieverId, loggedInUserId]);


  async function onSendMsg() {
    try {
      if (!currentMsg || !loggedInUserId || !recieverId) {
        return
      }

      await databases.createDocument(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_URL!,
        process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_MESSAGES!,
        'unique()',
        {
          content: currentMsg,
          senderId: loggedInUserId,
          recieverId: recieverId
        }
      );
      setCurrentMsg('')

    } catch (Err) {
      console.error(Err);
    }


  }

  async function onFileSend(e: React.ChangeEvent<HTMLInputElement>) {
    try {
      setUploading(true)
      const { files } = e.target;

      if (!files || files.length === 0) {
        return;
      }

      await Promise.all(
        Array.from(files).map(async (file) => {
          const uploadedFile = await storage.createFile(
            process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID!,
            'unique()',
            file
          );

          await databases.createDocument(
            process.env.NEXT_PUBLIC_APPWRITE_DATABASE_URL!,
            process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_MESSAGES!,
            'unique()',
            {
              content: uploadedFile.$id,
              messageType: 'file',
              senderId: loggedInUserId,
              recieverId: recieverId,
            }
          );
        })
      );

    } catch (Err) {
      console.error(Err);
    } finally {
      setUploading(false)
    }
  }

  useEffect(() => {
    async function getLiveMessages() {
      try {
        const unsubscribe = client.subscribe(
          `databases.${process.env.NEXT_PUBLIC_APPWRITE_DATABASE_URL!}.collections.${process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_MESSAGES!}.documents`,
          async (response: any) => {

            if (
              response.events.includes("databases.*.collections.*.documents.*.create") &&
              ((response.payload?.senderId === loggedInUserId && response.payload?.recieverId === recieverId) ||
                (response.payload?.senderId === recieverId && response.payload?.recieverId === loggedInUserId))
            ) {
              let newMessage = response.payload;

              if (newMessage?.messageType === "file") {
                const file = await storage.getFile(
                  process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID!,
                  newMessage.content
                );

                const { mimeType, name } = file

                const fileHref = await storage.getFileView(
                  process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID!,
                  newMessage.content
                );

                newMessage = { ...newMessage, mimeType, name, fileHref };
              }

              setMessages((prev) => {
                if (prev.some((msg) => msg.$id === response.payload?.$id)) return prev;
                return [...prev, newMessage];
              });

            }

            if (
              response.events.includes("databases.*.collections.*.documents.*.delete") &&
              response.payload?.$id
            ) {
              setMessages((prevMessages) =>
                prevMessages ? prevMessages.filter((message) => message.$id !== response.payload.$id) : []
              );
            }

          }
        );

        return () => unsubscribe();
      } catch (Err) {
        console.error(Err);
      }
    }

    getLiveMessages();

  }, []);

  useEffect(() => {
    scroll()
  }, [messages])


  async function onDelete(id: string) {
    try {
      const result = await Swal.fire({
        title: "Are you sure?",
        text: "Message will be deleted from both end !.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, Delete!",
      });

      if (!result.isConfirmed) {
        return
      }

      await databases.deleteDocument(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_URL!,
        process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_MESSAGES!,
        id
      )

      const updatedMessages = messages.filter((message) => message.$id !== id);
      setMessages(updatedMessages);

    } catch (err) {
      console.error(err);

    }
  }




  return (
    <div className={`h-full w-[75%] bg-black  px-11 p-4 overflow-clip relative ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
      <div className='flex items-center border select-none   rounded-tr-md rounded-tl-md    p-4 gap-4 shadow-md'>
        {user?.imageUrl ? (
          <Image src={user.imageUrl} width={100} height={100} alt='user' className='h-11 w-11  border-black rounded-full border' />
        ) : (
          <svg className='h-11 border rounded-full p-1' xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
            <path fill="#ffffff" d="M304 128a80 80 0 1 0 -160 0 80 80 0 1 0 160 0zM96 128a128 128 0 1 1 256 0A128 128 0 1 1 96 128zM49.3 464l349.5 0c-8.9-63.3-63.3-112-129-112l-91.4 0c-65.7 0-120.1 48.7-129 112zM0 482.3C0 383.8 79.8 304 178.3 304l91.4 0C368.2 304 448 383.8 448 482.3c0 16.4-13.3 29.7-29.7 29.7L29.7 512C13.3 512 0 498.7 0 482.3z" />
          </svg>
        )}

        <p className='w-full text-2xl font-bold text-white'>{user?.fullName || user?.userName}</p>

      </div>
      <Image src={bg} alt='bg' className='top-0 left-0 absolute h-full w-full opacity-25 ' />
      <div className='h-full  w-full border  lg:h-[68%] p-4 flex flex-col gap-3 overflow-y-auto'>


        {messages.map((message: Msg) => (
          <motion.div
            key={message.$id}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -40 }}
            transition={{ duration: 0.8 }}
          >
            <MsgBox key={message.$id} onDelete={onDelete} message={message} type={message?.senderId === loggedInUserId ? 'sender' : 'reciever'} />
          </motion.div>
        ))}
        {uploading && <p className='absolute top-1/2 left-1/3'>Sending...</p>}
        {loading && <Spinner size={50} />}
        <div ref={scrollRef}></div>
      </div>
      <div className={`flex w-full border rounded-br-md rounded-bl-md  h-14 bg-opacity-75$ ${theme === 'dark' ? 'bg-white' : 'bg-black'}`}>
        <div className='flex items-center gap-4 px-3'>
          <label>
            <svg className='h-8 opacity-85 cursor-pointer active:scale-95' xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill={theme === 'dark' ? "#000000" : "#ffffff"} d="M64 480H448c35.3 0 64-28.7 64-64V160c0-35.3-28.7-64-64-64H288c-10.1 0-19.6-4.7-25.6-12.8L243.2 57.6C231.1 41.5 212.1 32 192 32H64C28.7 32 0 60.7 0 96V416c0 35.3 28.7 64 64 64z" /></svg>
            <input onChange={onFileSend} type='file' className='hidden' multiple />
          </label>
          <label>
            <svg className='h-8 opacity-95 cursor-pointer active:scale-95' xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill={theme === 'dark' ? "#000000" : "#ffffff"} d="M149.1 64.8L138.7 96 64 96C28.7 96 0 124.7 0 160L0 416c0 35.3 28.7 64 64 64l384 0c35.3 0 64-28.7 64-64l0-256c0-35.3-28.7-64-64-64l-74.7 0L362.9 64.8C356.4 45.2 338.1 32 317.4 32L194.6 32c-20.7 0-39 13.2-45.5 32.8zM256 192a96 96 0 1 1 0 192 96 96 0 1 1 0-192z" /></svg>            <input type='file' className='hidden' />
            <input onChange={onFileSend} type='file' capture='environment' className='hidden' />
          </label>
        </div>
        <input onKeyDown={(e) => e.key === 'Enter' && onSendMsg()} onChange={(e) => setCurrentMsg(e.target.value)} value={currentMsg} type='text' placeholder='Enter your Message' className='w-full opacity-75 h-full outline-none px-4 py-2' />
        <svg onClick={onSendMsg} className='w-14  p-3 cursor-pointer active:scale-95' xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill='#2ec27e' d="M498.1 5.6c10.1 7 15.4 19.1 13.5 31.2l-64 416c-1.5 9.7-7.4 18.2-16 23s-18.9 5.4-28 1.6L284 427.7l-68.5 74.1c-8.9 9.7-22.9 12.9-35.2 8.1S160 493.2 160 480l0-83.6c0-4 1.5-7.8 4.2-10.8L331.8 202.8c5.8-6.3 5.6-16-.4-22s-15.7-6.4-22-.7L106 360.8 17.7 316.6C7.1 311.3 .3 300.7 0 288.9s5.9-22.8 16.1-28.7l448-256c10.7-6.1 23.9-5.5 34 1.4z" /></svg>
      </div>
    </div>
  )
}

export default MessageBox