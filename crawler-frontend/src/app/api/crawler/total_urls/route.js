import { NextResponse } from "next/server";

export async function GET(request) {
  // Forward all query params to backend
  const url = new URL(request.url);
  const searchParams = url.search ? url.search : '';
  const flaskRes = await fetch(`http://backend:5000/total_urls${searchParams}`);
  const data = await flaskRes.json();
  return NextResponse.json(data, { status: flaskRes.status });
} 