import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const task_id = searchParams.get('task_id');
  if (task_id) {
    // Tek bir job sonucu
    const flaskRes = await fetch(`http://backend:5000/job_result/${task_id}`);
    const data = await flaskRes.json();
    return NextResponse.json(data, { status: flaskRes.status });
  } else {
    // Tüm geçmişi çek
    const flaskRes = await fetch('http://backend:5000/history');
    const data = await flaskRes.json();
    return NextResponse.json(data, { status: flaskRes.status });
  }
}
