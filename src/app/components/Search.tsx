"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";
import React, { useRef } from "react";
import { oneLine, stripIndent } from "common-tags";

export default function Search() {
  const router = useRouter();
  const supabase = createClientComponentClient();
  const inputRef = useRef() as React.MutableRefObject<HTMLInputElement>;
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
    const searchText = inputRef.current.value;
    if (searchText && searchText.trim()) {
      const res = await fetch(location.origin + "/embeddings", {
        method: "POST",
        body: JSON.stringify({ text: searchText.replace(/\n/g, " ") }),
      });

      if (res.status != 200) {
        toastMsg("Failed to create embeddings");
      } else {
        const data = await res.json();
        const { data: documents } = await supabase.rpc("match_documents", {
          query_embedding: data.embedding,
          match_threshold: 0.8,
          match_count: 10,
        });

        let tokenCount = 0;
        let contextText = "";
        for (let i = 0; i < documents.length; i++) {
          const document = documents[i];
          const content = document.content;
          tokenCount += document.token;

          if (tokenCount > 1500) {
            break;
          }
          contextText += `${content.trim()}\n--\n`;
        }
        if (contextText) {
            generatePrompt(contextText, searchText);
            
        }
        console.log(documents)
      }
    }
  };

  const generatePrompt = (contextText: string, searchText: string) => {
    const prompt = stripIndent`${oneLine`
    You are an assistant that helps people understand research papers. Your purpose is to
    make research papers accessible to everyone, by lowering the entry barrier through interactive learning. 
    Given the following research paper or papers, answer the question using only that information,
    outputted in markdown format. Try not to mention that you are an AI model by OpenAI, ensure that you have a smooth
    conversation. If you are unsure and the answer
    is not explicitly written in these papers, say
    "Sorry, I would require more information to help you out"`}

    Context sections:
    ${contextText}

    Question: """
    ${searchText}
    """

    Answer as markdown (including related code snippets if available):
  `;
  return prompt;
  }

  return (
    <>
      <div className="flex-1 h-50dvh overflow-y-auto space-y-7">
        <div className="flex items-center justify-between border-b pb-3 border-[#292929]">
          <div>
            <h1 className="text-2xl text-easyResPink text-center font-bold  ">
              easy-research📃
            </h1>
          </div>
          <Button
            className="bg-easyResWhite text-easyResBg shadow-sm shadow-black"
            onClick={handleLogout}
          >
            Logout
          </Button>
        </div>
        <div className="text-easyResWhite space-y-3 flex items-center gap-2">
          <h1>[User]: How to setup supabase with Next.js</h1>
        </div>
      </div>
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
    </>
  );
}
