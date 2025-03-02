'use client'

import React from "react";
import musicIcon from '@/public/images/music_logo.png'
import Image from "next/image";

interface StoredFile {
  $id?: string;
  name?: string;
  fileHref?: string;
  mimeType?: string;
}

type Props = {
  files: StoredFile[] | FileList | null | undefined;
};



const PostFiles = ({ files }: Props) => {


  // Render file previews based on type
  const renderFilePreview = (file: any) => {
    const fileType = file.fileHref ? file.mimeType : file.type;
    const fileName = file.name;
    const fileURL = file.fileHref ? file.fileHref : URL.createObjectURL(file)

    if (fileType.startsWith("image/")) {
      return (
        <a href={fileURL} download={fileName}>
          <img src={fileURL} alt={fileName} className="w-full h-auto rounded mt-2" />
        </a>
      );
    }

    if (fileType.startsWith("video/")) {
      return (
        <a href={fileURL} download={fileName}>
          <video controls className="w-full h-auto rounded mt-2">
            <source src={fileURL} type={fileType} />
            Your browser does not support the video tag.
          </video>
        </a>
      );
    }

    if (fileType.startsWith("audio/")) {
      return (
        <a href={fileURL} download={fileName}>
          <Image src={musicIcon} alt={fileName} className="w-1/2 m-auto rounded mt-2" />
          <audio controls className="mt-2 w-full">
            <source src={fileURL} type={fileType} />
            Your browser does not support the audio tag.
          </audio>
        </a>
      );
    }

    if (fileType === "application/pdf") {
      return (
        <a href={fileURL} download={fileName}>
          <iframe src={fileURL} className="w-full mt-2 border rounded" title={fileName}></iframe>
        </a>
      );
    }

    // Provide a fallback for unsupported file types
    return (
      <a href={fileURL} download={fileName} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline mt-2 inline-block">
        <div className="h-28 w-full bg-slate-200 flex items-center justify-center">
          <span className="text-sm m-auto text-gray-600">{fileName}</span>
        </div>
      </a>
    );
  };

  return (
    <div className="w-full p-4">
      {files &&
        Array.from(files as any).map((file, index) => (

          <div className="p-2 my-3 border rounded" key={index}>{renderFilePreview(file)}</div>

        ))}
    </div>
  );
};

export default PostFiles;
