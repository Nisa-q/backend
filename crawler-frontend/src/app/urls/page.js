"use client";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import React from "react";

export default function UrlsPage() {
  const [url, setUrl] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [urls, setUrls] = useState([]);
  const [fetching, setFetching] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [total, setTotal] = useState(0);

  const fetchUrls = async (pageNum = page, filterVal = filter, statusVal = statusFilter) => {
    setFetching(true);
    let url = `/api/crawler/urls?page=${pageNum}&pageSize=${pageSize}`;
    if (filterVal) url += `&search=${encodeURIComponent(filterVal)}`;
    if (statusVal) url += `&status=${encodeURIComponent(statusVal)}`;
    const res = await fetch(url);
    const data = await res.json();
    setUrls(Array.isArray(data.data) ? data.data : data);
    setTotal(data.total || 0);
    setFetching(false);
  };

  React.useEffect(() => {
    fetchUrls(page, filter, statusFilter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, filter, statusFilter]);

  const handleFilterChange = e => {
    setFilter(e.target.value);
    setPage(1);
  };
  const handleStatusChange = e => {
    setStatusFilter(e.target.value);
    setPage(1);
  };

  const handleCrawl = async () => {
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/crawler/urls", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const data = await res.json();
      setResult(data);
      setUrl("");
      fetchUrls(1, filter, statusFilter); // Always refresh to first page after crawl
      setPage(1);
    } catch (e) {
      setResult({ error: "Bir hata oluştu." });
    }
    setLoading(false);
  };

  // Remove filteredUrls, always use urls from backend
  // Pagination controls
  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">URL Crawler</h1>
        <p className="text-muted-foreground">Bir URL girerek Flask crawler&apos;ı başlat</p>
      </div>
      {/* 'URL Gir' kısmı kaldırıldı */}
      <Card>
        <CardHeader>
          <CardTitle>URL Listesi</CardTitle>
          <CardDescription>Eklenen ve crawl edilen URL&apos;ler</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-4">
            <Input
              placeholder="URL ara..."
              value={filter}
              onChange={handleFilterChange}
              className="max-w-xs"
            />
            <select
              value={statusFilter}
              onChange={handleStatusChange}
              className="border rounded px-2 py-1"
            >
              <option value="">Tüm Durumlar</option>
              <option value="success">Başarılı</option>
              <option value="pending">Bekliyor</option>
            </select>
            {/* <Button variant="outline" onClick={fetchUrls} disabled={fetching}>
              Yenile
            </Button> */}
          </div>
          <div className="overflow-x-auto w-full">
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
                {urls.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground">
                      Kayıt yok
                    </TableCell>
                  </TableRow>
                ) : (
                  urls.map(u => (
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
          {/* Pagination Controls */}
          <div className="flex justify-between items-center mt-4">
            <Button
              variant="outline"
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
            >
              Önceki
            </Button>
            <span>
              Sayfa {page} / {totalPages || 1}
            </span>
            <Button
              variant="outline"
              onClick={() => setPage(page + 1)}
              disabled={page === totalPages || totalPages === 0}
            >
              Sonraki
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 