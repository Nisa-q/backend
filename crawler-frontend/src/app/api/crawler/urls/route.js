import { NextResponse } from "next/server";

export async function GET(request) {
  // Forward all query params to backend
  const url = new URL(request.url);
  const searchParams = url.search ? url.search : '';
  const flaskRes = await fetch(`http://backend:5000/urls${searchParams}`);
  const data = await flaskRes.json();
  const response = NextResponse.json(data, { status: flaskRes.status });
  response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  response.headers.set('Pragma', 'no-cache');
  response.headers.set('Expires', '0');
  return response;
}

export async function POST(request) {
  const body = await request.json();
  // Eğer sadece url geldiyse, uygun Flask formatına çevir
  const flaskBody = body.url ? { job_name: "katana_crawler", url: body.url } : body;
  const flaskRes = await fetch('http://backend:5000/run_job', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(flaskBody),
  });
  const data = await flaskRes.json();
  return NextResponse.json(data, { status: flaskRes.status });
}
