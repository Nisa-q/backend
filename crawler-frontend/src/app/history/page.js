
"use client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";

export default function HistoryPage() {
  const { data: history, isLoading, error } = useQuery({
    queryKey: ["crawler-history"],
    queryFn: async () => {
      const response = await fetch("/api/crawler/history");
      if (!response.ok) throw new Error("Geçmiş verisi alınamadı");
      return response.json();
    }
  });

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "text-green-600 bg-green-50";
      case "failed":
        return "text-red-600 bg-red-50";
      case "running":
        return "text-blue-600 bg-blue-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "completed":
        return "Tamamlandı";
      case "failed":
        return "Başarısız";
      case "running":
        return "Çalışıyor";
      default:
        return status;
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Crawler Geçmişi</h1>
            <p className="text-muted-foreground">
              Crawler&#39;ın çalıştırılma geçmişini ve sonuçlarını incele
            </p>
          </div>
          <Link href="/">
            <Button variant="outline">← Ana Sayfa</Button>
          </Link>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Çalıştırma Geçmişi</CardTitle>
          <CardDescription>
            Crawler&#39;ın tüm çalıştırılma kayıtları ve sonuçları
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Yükleniyor...</div>
          ) : error ? (
            <div className="text-center py-8 text-red-600">
              Hata: {error.message}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Zaman</TableHead>
                    <TableHead>Durum</TableHead>
                    <TableHead>Sonuç Sayısı</TableHead>
                    {/* <TableHead>İşlemler</TableHead> */}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {history?.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground">
                        Henüz crawler çalıştırılmamış
                      </TableCell>
                    </TableRow>
                  ) : (
                    history?.map((item) => {
                      let urlCount = typeof item.resultCount === 'number' ? item.resultCount : 0;
                      let urlCountDisplay = urlCount > 0 ? (
                        <span className="font-medium text-green-600">{urlCount} URL</span>
                      ) : item.status === 'failed' ? (
                        <span className="text-red-600">Hata</span>
                      ) : (
                        <span className="text-muted-foreground">0 URL</span>
                      );
                      return (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">#{item.id}</TableCell>
                        <TableCell>
                          {new Date(item.timestamp).toLocaleString('tr-TR')}
                        </TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                            {getStatusText(item.status)}
                          </span>
                        </TableCell>
                        <TableCell>
                            {urlCountDisplay}
                        </TableCell>
                      </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Toplam Çalıştırma</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{history?.length || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Başarılı</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {history?.filter(h => h.status === 'completed').length || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Başarısız</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {history?.filter(h => h.status === 'failed').length || 0}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 