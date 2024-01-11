import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Search from "./components/Search";

export default async function Home() {
  const supabase = createServerComponentClient({ cookies });

  const { data } = await supabase.auth.getSession();
  if (!data.session) {
    return redirect("/auth");
  }

  return (
    <div className="bg-easyResBg">
      <div className=" max-w-5xl mx-auto h-screen flex justify-center items-center flex-col">
        <style jsx>{`
          @media (min-width: 450px) {
            .flex-col {
              flex-direction: row;
            }
          }
        `}</style>
        <div className="w-3/5 h-3/4 rounded-sm shadow-md shadow-[#000000] flex flex-col p-5 bg-easyResBoxBg">
          <Search />
        </div>
      </div>
      ;
    </div>
  );
}
