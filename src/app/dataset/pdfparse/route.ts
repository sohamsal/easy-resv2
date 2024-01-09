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

    return NextResponse.json({ message: "PDF loaded successfully", docs }, { status: 200 });
  } catch (error) {
    console.error('Error processing PDF:', error);
    return NextResponse.error();
  }
}