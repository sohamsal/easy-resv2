// route.ts
import { NextResponse } from "next/server";
import { WebPDFLoader } from "langchain/document_loaders/web/pdf";

export async function POST(req: Request) {
  const formData = await req.formData();
  const file = formData.get("file") as Blob;

  if (!file) {
    return NextResponse.error();
  }

  try {
    const loader = new WebPDFLoader(file);
    const docs = await loader.load();

    // Assuming you want to send the document data back to the client
    return NextResponse.json({ message: "PDF loaded successfully", docs }, { status: 200 });
  } catch (error) {
    console.error('Error processing PDF:', error);
    return NextResponse.error();
  }
}

/*
-- Supabase AI is experimental and may produce incorrect answers
-- Always verify the output before executing

create
or replace function match_documents (
  query_embedding vector (1536),
  match_threshold float,
  match_count int,
  user_id uuid
) returns table (
  id bigint,
  content text,
  similarity float,
  token int,
  user_id uuid
) language sql stable as $$
  SELECT
    documents.id,
    documents.content,
    1 - (documents.embedding <=> query_embedding) AS similarity,
    documents.token,
    documents.user_id
  FROM documents
  WHERE documents.embedding <=> query_embedding < 1 - match_threshold
  AND documents.user_id = user_id
  ORDER BY documents.embedding <=> query_embedding
  LIMIT match_count;
$$;


how can I make my documents and user tables match by only calling the function match_documents on the functions with a specific uuid
*/