import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  const isAuth = cookies().get("sb-jbxtronawrxadrnqizje-auth-token");
  if (!isAuth) {
    return NextResponse.json({ message: "Forbidden access" }, { status: 403 });
  }

  const { prompt } = await req.json();
  try {
    const res = await openai.completions.create({
      prompt,
      model: "text-davinci-003",
      max_tokens: 512,
      temperature: 0,
    });
    return NextResponse.json({ choices: res.choices });
  } catch {
    return NextResponse.json(
      { message: "Something went wrong!" },
      { status: 400 }
    );
  }
}