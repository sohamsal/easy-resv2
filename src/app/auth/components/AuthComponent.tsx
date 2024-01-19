"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

export default function AuthComponent() {
  const supabase = createClientComponentClient();
  const githubLogin = () => {
    supabase.auth.signInWithOAuth({
      provider: "github",
      options: {
        redirectTo: "https://easyres.vercel.app" + "/auth/callback",
      },
    });
  };

  const googleLogin = () => {
    supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `https://easyres.vercel.app/` + "auth/callback",
      },
    });
  };

  return (
    <div className=" w-full h-screen flex flex-col justify-center items-center bg-easyResBg ">
      <h1 className="font-bold text-5xl text-easyResPink text-center">
        Welcome to easy-research!
      </h1>
      <p className=" text-sm text-center text-easyResWhite mt-5 mx-5">
        Making research papers accessible to everyone, by lowering the entry
        barrier through interactive learning. <br />
        <br />
        This project is still a WIP. Essentially this is a GPT-Wrapper, but
        check out the 
        <a
        href="https://www.notion.so/sohamsal/What-I-m-working-on-42634915a37445c4a0081f08f62f8725?pvs=4#6df6d74626ac4da7b4e3e39307f6e206"
        target="_blank"
        className="text-easyResPink underline"
      >
        notion page
      </a>
         for my plans (if you have not already). <br />
        Below is a VERY early demo of the first iteration of the app:{" "}
      </p>
      <div className="flex flex-col justify-center items-center">
        <iframe
          className="w-full m-5 aspect-video"
          src="https://www.youtube.com/embed/cdyh5yn94PY?si=KvjmlWb1u0VOo801"
          title="YouTube video player"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        ></iframe>
      </div>
      <Button
        className="w-1/3 m-5 text-easyResBg bg-easyResWhite hover:bg-easyResBg hover:border-easyResWhite hover:border-2"
        onClick={googleLogin}
      >
        <p className="overflow-hidden text-ellipsis">
          Register/Login with Google
        </p>
      </Button>

      <style>
        {`
          @media (min-width: 768px) {
            iframe {
              width: 670px;
              height: 376px;
            }
          }
        `}
      </style>
    </div>
  );
}

//<div className=" w-50dvw h-50dvh shadow-sm p-6 rounded-sm space-y-2 bg-easyResBoxBg "></div>
