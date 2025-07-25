"use client";
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import Link from "next/link";

export default function CommandsPage() {
  const [runStatus, setRunStatus] = useState(null);
  const [taskId, setTaskId] = useState("");
  const [jobResult, setJobResult] = useState(null);
  const [command, setCommand] = useState("");
  const [url, setUrl] = useState("");
  const [urls, setUrls] = useState([]);
  const [filter, setFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [fetching, setFetching] = useState(false);

  const fetchUrls = async () => {
    setFetching(true);
    const res = await fetch("/api/crawler/urls");
    const data = await res.json();
    setUrls(Array.isArray(data) ? data : data.data || []);
    setFetching(false);
  };

  useEffect(() => {
    fetchUrls();
  }, []);

  const runCommand = async () => {
    setRunStatus(null);
    setJobResult(null);
    try {
      const response = await fetch("/api/crawler/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ job_name: "command_runner", command }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Komut çalıştırılamadı");
      setRunStatus({ status: "success", message: `Komut çalışıyor`, task_id: data.task_id });
      setTaskId(data.task_id || "");
    } catch (e) {
      setRunStatus({ status: "error", message: e.message });
    }
  };

  const runKatana = async () => {
    setRunStatus(null);
    setJobResult(null);
    try {
      const response = await fetch("/api/crawler/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ job_name: "katana_crawler", url }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Crawl başlatılamadı");
      setRunStatus({ status: "success", message: `Katana crawl başlatıldı`, task_id: data.task_id });
      setTaskId(data.task_id || "");
      fetchUrls();
    } catch (e) {
      setRunStatus({ status: "error", message: e.message });
    }
  };

  const fetchJobResult = async () => {
    if (!taskId) return;
    setJobResult(null);
    const res = await fetch(`/api/crawler/job_result/${taskId}`);
    const data = await res.json();
    setJobResult(data);
  };

  const filteredUrls = urls.filter(u =>
    (!filter || u.url.toLowerCase().includes(filter.toLowerCase())) &&
    (!statusFilter || u.status === statusFilter)
  );

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Job Çalıştır</h1>
            <p className="text-muted-foreground">
              Komut çalıştırıcı veya Katana crawler ile görev başlat
            </p>
          </div>
          <Link href="/">
            <Button variant="outline">← Ana Sayfa</Button>
          </Link>
        </div>
      </div>
      <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Komut Çalıştırıcı</CardTitle>
            <CardDescription>Terminal komutu girip çıktısını görebilirsin</CardDescription>
          </CardHeader>
          <CardContent>
            <Input
              placeholder="örn: ls -l"
              value={command}
              onChange={e => setCommand(e.target.value)}
              className="mb-2"
            />
            <Button
              onClick={runCommand}
              disabled={!command}
            >
              Komut Çalıştır
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Katana Crawler</CardTitle>
            <CardDescription>Bir web sitesi adresi girip crawl başlat</CardDescription>
          </CardHeader>
          <CardContent>
            <Input
              placeholder="örn: https://ornek.com"
              value={url}
              onChange={e => setUrl(e.target.value)}
              className="mb-2"
            />
            <Button
              onClick={runKatana}
              disabled={!url}
            >
              Katana ile Crawl
            </Button>
          </CardContent>
        </Card>
      </div>
      <div className="mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Sonuç</CardTitle>
          </CardHeader>
          <CardContent>
            {runStatus && (
              <div className={`mt-2 p-4 rounded-lg ${
                runStatus.status === "success"
                  ? "bg-green-50 border border-green-200 text-green-800"
                  : "bg-red-50 border border-red-200 text-red-800"
              }`}>
                <p className="font-medium">{runStatus.message}</p>
                {runStatus.task_id && (
                  <div className="mt-2">
                    <span className="font-mono">Task ID: {runStatus.task_id}</span>
                    <Button size="sm" className="ml-2" onClick={fetchJobResult}>
                      Sonucu Getir
                    </Button>
                  </div>
                )}
              </div>
            )}
            {jobResult && (
              <div className="mt-4 p-4 rounded-lg bg-blue-50 border border-blue-200 text-blue-800">
                <pre className="whitespace-pre-wrap break-all text-xs">{JSON.stringify(jobResult, null, 2)}</pre>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      <div className="mb-6">
        <Card>
          <CardHeader>
            <CardTitle>URL Geçmişi</CardTitle>
            <CardDescription>Eklenen ve crawl edilen URL&apos;ler</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 mb-4">
              <Input
                placeholder="URL ara..."
                value={filter}
                onChange={e => setFilter(e.target.value)}
                className="max-w-xs"
              />
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="border rounded px-2 py-1"
              >
                <option value="">Tüm Durumlar</option>
                <option value="success">Başarılı</option>
                <option value="pending">Bekliyor</option>
              </select>
              <Button variant="outline" onClick={fetchUrls} disabled={fetching}>
                Yenile
              </Button>
            </div>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>URL</TableHead>
                    <TableHead>Durum</TableHead>
                    <TableHead>Crawl Zamanı</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUrls.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground">
                        Kayıt yok
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredUrls.map(u => (
                      <TableRow key={u.id}>
                        <TableCell>{u.id}</TableCell>
                        <TableCell>{u.url}</TableCell>
                        <TableCell>{u.status === "success" ? "Başarılı" : u.status}</TableCell>
                        <TableCell>{u.crawledAt ? new Date(u.crawledAt * 1000).toLocaleString("tr-TR") : "-"}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 