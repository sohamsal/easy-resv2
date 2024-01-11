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
				redirectTo:`${location.origin}` + "/auth/callback",
			},
		});
	};

  const googleLogin = () => {
    supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
            redirectTo: `${location.origin}` + "auth/callback" ,
        },
    });
  };

  

  return (
    <div className=" w-full h-screen flex flex-col justify-center items-center bg-easyResBg ">
        <h1 className="font-bold text-5xl text-easyResPink">Welcome to easy-research!</h1>
        <p className=" text-sm text-center text-easyResWhite mt-5">
          Making research papers accessible to everyone, by lowering the entry
          barrier through interactive learning. <br/><br/>Below is a demo of the app:{" "}
        </p>
        <iframe className="mt-5"width="672" height="378" src="https://www.youtube.com/embed/5frZSfMNEmc?si=D--vWSixpGR6CkYv" title="YouTube video player" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen></iframe>
        <Button
          className="w-1/3 m-5 text-easyResBg bg-easyResWhite   hover:bg-easyResBg hover:border-easyResWhite hover:border-2"
          onClick={googleLogin}
        >
          <p>Register/Login with Google</p>
        </Button>
    </div>
  );
}

//<div className=" w-50dvw h-50dvh shadow-sm p-6 rounded-sm space-y-2 bg-easyResBoxBg "></div>