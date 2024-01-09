import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  const supabase = createServerComponentClient({ cookies });
  const { data, error } = await supabase.auth.getSession();
  const { data: user } = await supabase
    .from("users")
    .select("id")
    .eq("id", data!.session!.user.id)
    .single();
  
  

  /*const isAuth = cookies().get("sb-jbxtronawrxadrnqizje-auth-token");
  if (!isAuth) {
    return NextResponse.json({ message: "Forbidden access" }, { status: 403 });
  }*/

  const request = await req.json();
  

  if (!request?.text) {
    return NextResponse.json(
      {
        message: "Invalid request, missing text",
      },
      { status: 422 }
    );
  }

  try {
    const result = await openai.embeddings.create({
      input: request.text,
      model: "text-embedding-ada-002",
    });

    const embedding = result.data[0].embedding;
    const token = result.usage.total_tokens;
    const uuid = user?.id;
    return NextResponse.json({
      embedding,
      token, 
      uuid
    });

  } catch {
    return NextResponse.json(
      {
        message: "Something went wrong",
      },
      { status: 400 }
    );
  }
}
