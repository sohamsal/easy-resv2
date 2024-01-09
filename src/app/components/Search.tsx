"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";
import React, { useRef, useState } from "react";
import { oneLine, stripIndent } from "common-tags";

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
    setLoading(true);
    const searchText = inputRef.current.value;
    if (searchText && searchText.trim()) {
      setQuestion((currentQuestion) => [...currentQuestion, searchText]);

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
          match_threshold: 0.7,
          match_count: 10,
        });

        let tokenCount = 0;
        let contextText = "";
        /*for (let i = 0; i < documents.length; i++) {
          const document = documents[i];
          const content = document.content;
          tokenCount += document.token;
          contextText += `${content.trim()}\n--\n`;
        }*/
        const content = documents[0].content
        contextText += content
        console.log(contextText)
        if (contextText) {
          const prompt = generatePrompt(contextText, searchText);
          await generateAnswers(prompt);
        } else {
          setAnswer((currentAnswer) => [
            ...currentAnswer,
            "Sorry, not enough context provided!",
          ]);
        }
      }
    }
    inputRef.current.value = "";
    setLoading(false);
  };

  const generateAnswers = async (prompt: string) => {
    try {
      const res = await fetch(location.origin + "/chat", {
        method: "POST",
        body: JSON.stringify({ prompt }),
      });

      const data = await res.json();
      console.log(data.choices[0].message.content)
      if (data.choices && data.choices.length > 0) {
        setAnswer((currentAnswer) => [...currentAnswer, data.choices[0].message.content]);
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
    "Sorry, I would require more information to help you out"`}

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
        {questions.map((question: string, index) => {
          const answer = answers[index];
          const isLoading = loading && !answer;
          return (
            <div
              key={index}
              className="text-easyResWhite space-y-3 flex flex-column items-center gap-2"
            >
              {isLoading ? <h1>Loading...</h1> : <p>{answer}</p>}
            </div>
          );
        })}
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
