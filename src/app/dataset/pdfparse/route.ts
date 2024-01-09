// route.ts
import { NextResponse } from "next/server";
import pdf from "pdf-parse";
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
