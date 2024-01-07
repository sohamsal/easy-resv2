"use client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import React, { useRef, useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

export default function Forms() {
  const supabase = createClientComponentClient();
  const inputRef = useRef() as React.MutableRefObject<HTMLTextAreaElement>;
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const toastMsg = (error: string) => {
    toast({
      title: `${error}`,
    });
  };


  const handleSubmit = async () => {
    setLoading(true);
    const content = inputRef.current.value;
    if (content && content.trim()) {
      const res = await fetch(location.origin + "/embeddings", {
        method: "POST",
        body: JSON.stringify({ text: content.replace(/\n/g, " ") }),
      });

      if (res.status != 200) {
        toastMsg("Failed to retrieve embeddings");
      } else {
        toastMsg("Successfully retrieved embeddings");
        const result = await res.json();
        const embedding = result.embedding;
        const token = result.token;

        try {
          await supabase.from("documents").insert({
          content,
          embedding,
          token,
        });
        toastMsg("Successfully stored embeddings")
        inputRef.current.value = "";
        
        }
        catch{
          toastMsg("Failed to insert embeddings into Supabase");
        }
      
      }
    }
    setLoading(false);
  };

  return (
    <div>
      <Textarea
        className="p-2 h-100 bg-easyResBg text-easyResWhite my-2"
        placeholder="add your files here"
        ref={inputRef}
      />
      <Button
        onClick={handleSubmit}
        className="w-full bg-easyResWhite text-easyResBg my-2"
      >
        Submit
      </Button>
    </div>
  );
}
