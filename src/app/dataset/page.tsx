import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Textarea } from "@/components/ui/textarea";
import React from "react";
import { Button } from "@/components/ui/button";
import Forms from "./components/Forms"

export default async function Page() {
  const supabase = createServerComponentClient({ cookies });

  const { data } = await supabase.auth.getSession();
  if (!data.session) {
    return redirect("/auth");
  }

  const { data: user } = await supabase
    .from("users")
    .select("role")
    .eq("id", data.session.user.id)
    .single();

  if (user?.role !== "admin") {
    return redirect("/");
  }

  return (
    <div className="bg-easyResBg">
      <div className="max-w-4xl mx-auto h-screen flex justify-center items-center flex-column">
        <div className="w-full p-5 space-y-3">
          <div className=" flex items-center gap-2 text-easyResPink text-4xl font-bold">
            <h1>Input your dataset here</h1>
          </div>

          <Forms/>
        </div>
      </div>
    </div>
  );
}
