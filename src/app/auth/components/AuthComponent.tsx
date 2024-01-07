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
				redirectTo: location.origin + "/auth/callback",
			},
		});
	};

  const googleLogin = () => {
    supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
            redirectTo: location.origin + "/auth/callback" ,
        },
    });
  };

  

  return (
    <div className=" w-full h-screen flex justify-center items-center bg-easyResBg ">
      <div className=" w-96  shadow-sm p-6 rounded-sm space-y-2 bg-easyResBoxBg ">
        <h1 className="font-bold text-xl text-easyResPink">Welcome</h1>
        <p className=" text-sm text-easyResWhite">
          Making research papers accessible to everyone, by lowering the entry
          barrier through interactive learning.{" "}
        </p>
        <Button
          className="w-full text-easyResBg bg-easyResWhite"
          onClick={googleLogin}
        >
          Login with Google
        </Button>
      </div>
    </div>
  );
}
