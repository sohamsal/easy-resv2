"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";
import React, { useRef, useState } from "react";
import { oneLine, stripIndent } from "common-tags";
import Link from "next/link";

export default function Search() {
  const router = useRouter();
  const supabase = createClientComponentClient();
  const inputRef = useRef() as React.MutableRefObject<HTMLInputElement>;
  const [questions, setQuestion] = useState<string[]>([]);
  const [answers, setAnswer] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const { toast } = useToast();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.refresh();
  };

  const toastMsg = (error: string) => {
    toast({
      title: `${error}`,
    });
  };

  const handleSearch = async () => {
    const { data, error } = await supabase.auth.getSession();
    const { data: user } = await supabase
      .from("users")
      .select("id")
      .eq("id", data!.session!.user.id)
      .single();

    const userSessionId = user?.id;
    setLoading(true);
    const searchText = inputRef.current.value;
    if (searchText && searchText.trim()) {
      setQuestion((currentQuestion) => [...currentQuestion, searchText]);

      const res = await fetch(`https://easyres.vercel.app` + "/embeddings", {
        method: "POST",
        body: JSON.stringify({ text: searchText.replace(/\n/g, " ") }),
      });

      if (res.status != 200) {
        toastMsg("Failed to create embeddings");
      } 
      else 
      {
        const data = await res.json();

        const { data: documents } = await supabase.rpc("match_documents", {
          query_embedding: data.embedding,
          match_threshold: 0.25,
          match_count: 10,
        });

        let contextText = "";
        /*for (let i = 0; i < documents.length; i++) {
          const document = documents[i];
          const content = document.content;
          tokenCount += document.token;
          contextText += `${content.trim()}\n--\n`;
        }*/
        if (documents.length !== 0) 
        {
          if (documents[0].uuid == `${userSessionId}`) {
            const content = documents[0].content;
            contextText += content;
          } else if (
            documents[0].uuid !== `${userSessionId}` && 
            documents.length > 1
          ) {
            if (
              documents[1].uuid === `${userSessionId}` &&
              documents[1].content === documents[0].content
            ) {
              const content = documents[1].content;
              contextText += content;
            }
          } else {
            contextText = documents;
          }
          if (contextText) {
            const prompt = generatePrompt(contextText, searchText);
            await generateAnswers(prompt);
          } else {
            setAnswer((currentAnswer) => [
              ...currentAnswer,
              "Sorry, not enough context provided! Please be more descriptive about the document!",
            ]);
          }
        }
        else {
          setAnswer((currentAnswer) => [
            ...currentAnswer,
            "If you see this message, then the application is down right now, I plan to fix it as soon as I get school and stuff out of the way\n Here's a video link for how it would've worked: https://www.youtube.com/watch?v=cdyh5yn94PY",
          ]);
        }
      }
    }
    inputRef.current.value = "";
    setLoading(false);
  };

  const generateAnswers = async (prompt: string) => {
    try {
      
      const res = await fetch(`https://easyres.vercel.app` + "/chat", {
        method: "POST",
        body: JSON.stringify({ prompt }),
      });

      const data = await res.json();
      if (data.choices && data.choices.length > 0) {
        setAnswer((currentAnswer) => [
          ...currentAnswer,
          data.choices[0].message.content,
        ]);
      } else {
        toastMsg("No choices available");
      }
    } catch {
      toastMsg("Error encountered generating answers");
    }
  };

  const generatePrompt = (contextText: string, searchText: string) => {
    const prompt = stripIndent`${oneLine`
    You are an helpful assistant that helps people understand things by asking questions. 
    You will be expected to answer queries based on anything in the context section.
    Your purpose is but NOT limited to making information accessible to everyone, 
    by lowering the entry barrier through interactive learning. 
    Given the following information, answer the question using only that information,
    outputted in markdown format. Try not to mention that you are an AI model by OpenAI, ensure that you have a smooth
    conversation. If you are unsure and the answer
    is not explicitly written in these papers, say
    "Sorry, I would require more information to help you out "`}

    Context sections:
    ${contextText}

    Question: """
    ${searchText}
    """

    Answer as markdown (including related code snippets if available):
  `;
    return prompt;
  };

  return (
    <>
      <div className="flex-1 h-50dvh space-y-7 max-h-dvh overflow-auto">
        <div className="flex items-center justify-between border-b pb-3 border-[#292929]">
          <div>
            <h1 className="text-4xl text-easyResPink text-center font-bold  ">
              easy-research📃
            </h1>
          </div>
          <Button
            className="bg-easyResWhite text-easyResBg shadow-sm shadow-black hover:bg-easyResBg hover:border-none max-[450px]:mt-10"
            onClick={handleLogout}
          >
            Logout
          </Button>
        </div>
        {questions.map((question: string, index) => {
          const answer = answers[index];
          const isLoading = loading && !answer;
          return (
            <div
              key={index}
              className="text-easyResWhite flex flex-column items-center p-2 mb-2 hover:bg-easyResBg"
            >
              {isLoading ? <h1>Loading...</h1> : <p>{answer}</p>}
            </div>
          );
        })}
      </div>
      <div className="flex flex-row items-center">
        <Input
          ref={inputRef}
          className="p-3 border-none bg-easyResBg text-easyResWhite border-2 shadow-sm shadow-black"
          placeholder="type your question here (ex. what is the point of this paper?)"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleSearch();
            }
          }}
        />
        <Button
          onClick={handleSearch}
          className="ml-3 bg-easyResWhite text-easyResBg shadow-sm shadow-black hover:bg-easyResBg hover:border-none"
        >
          ▶
        </Button>
      </div>
      <Link href={`https://easyres.vercel.app/dataset`}>
        <Button className="w-full mt-4 bg-easyResPink border-easyResBg text-easyResBg  shadow-black hover:bg-easyResBg ">
          Add your data
        </Button>
      </Link>
      
    </>
  );
}
