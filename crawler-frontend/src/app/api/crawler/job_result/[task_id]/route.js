import { NextResponse } from 'next/server';

export async function GET(request, { params }) {
  const { task_id } = params;
  if (!task_id) {
    return NextResponse.json({ error: 'task_id is required' }, { status: 400 });
  }
  const flaskRes = await fetch(`http://backend:5000/job_result/${task_id}`);
  const data = await flaskRes.json();
  return NextResponse.json(data, { status: flaskRes.status });
} 