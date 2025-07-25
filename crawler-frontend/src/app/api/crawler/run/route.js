import { NextResponse } from 'next/server';

export async function POST(request) {
  const body = await request.json();
  const flaskRes = await fetch('http://backend:5000/run_job', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await flaskRes.json();
  return NextResponse.json(data, { status: flaskRes.status });
}
