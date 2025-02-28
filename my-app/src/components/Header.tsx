import React from "react";

export default function Header() {
  return (
    <header className="w-full p-4 bg-gray-100 shadow-md flex justify-between items-center">
      <h1 className="text-2xl font-bold">Audio Transcription</h1>
      <nav>
        <a href="/login" className="text-blue-600 hover:underline">Log in</a>
        <a href="/signup" className="ml-4 text-blue-600 hover:underline">Sign up</a>
      </nav>
    </header>
  );
}