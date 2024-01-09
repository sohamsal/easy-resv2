// Forms.tsx
"use client";
import React, { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { WebPDFLoader } from "langchain/document_loaders/web/pdf";

export default function Forms() {
  const supabase = createClientComponentClient();
  const inputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const [pageTextStr, setPageTextStr] = useState<string | null>(null);

  const toastMsg = (error: string) => {
    toast({
      title: `${error}`,
    });
  };

  const handleChange = async () => {
    const file = inputRef.current?.files?.[0];

    if (!file) {
      toastMsg("Please select a PDF file.");
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const req = await fetch(location.origin + "/dataset/pdfparse", {
        method: "POST",
        body: formData,
      });

      const data = await req.json();
      console.log(data);

      // Assuming data.docs is an array of Document objects
      const pageTextArr = data.docs.map((doc: any) => doc.pageContent);
      setPageTextStr(pageTextArr[0])

      toastMsg("PDF loaded successfully!");
    } catch (error) {
      console.error("Error handling file:", error);
      toastMsg(`Error handling file`);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    const content = pageTextStr;
    if (content && content.trim()) {
      console.log(content)
      const res = await fetch(location.origin + "/embeddings", {
        method: "POST",
        body: JSON.stringify({ text: content.replace(/\n/g, " ") }),
      });

      if (res.status !== 200) {
        toastMsg("Error");
      } else {
        const result = await res.json();
        const embedding = result.embedding;
        const token = result.token;

        const { error } = await supabase.from("documents").insert({
          content,
          embedding,
          token,
        });
        if (error) {
          toastMsg(error.message);
        } else {
          toast({
            title: "Successfully create embedding.",
          });
          setPageTextStr("");
        }
      }
    }
    setLoading(false);
  };

  return (
    <div>
      <Input
        type="file"
        accept=".pdf"
        onChange={handleChange}
        className="p-2 h-10 bg-easyResWhite text-easyResBg underline my-2"
        ref={inputRef}
      />
      <Button
        className="w-full bg-easyResWhite text-easyResBg my-2"
        onClick={handleSubmit}
        disabled={loading}
      >
        {loading ? "Loading..." : "Submit"}
      </Button>
    </div>
  );
}
