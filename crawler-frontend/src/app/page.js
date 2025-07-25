"use client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import React, { useEffect, useState } from "react";

export default function Home() {
  const [totalUrls, setTotalUrls] = useState(0);
  const [stats, setStats] = useState({ totalRuns: 0, lastRun: null });
  // Remove loading state

  // Fetch total URL count from /total_urls
  const fetchTotalUrls = async () => {
    const res = await fetch("/api/crawler/total_urls", { cache: "no-store" });
    const data = await res.json();
    setTotalUrls(data.totalUrls || 0);
  };

  // Fetch stats (history, lastRun)
  const fetchStats = async () => {
    const historyRes = await fetch("/api/crawler/history", { cache: "no-store" });
      const history = await historyRes.json();
    setStats({
        totalRuns: history.length,
      lastRun: history[0]?.timestamp || null
    });
  };

  // Fetch data (used for both mount and manual refresh)
  const fetchAll = async () => {
    await Promise.all([fetchTotalUrls(), fetchStats()]);
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      fetchAll();
    }
  }, []);

  // Remove loading screen, always show dashboard
  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Crawler Dashboard</h1>
        <p className="text-muted-foreground">
          Web crawler yönetim sistemi - Komut çıktıları, geçmiş ve URL tablosu
        </p>
        {/* Yenile butonunu kaldırdık */}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Toplam Çalıştırma</CardTitle>
            <CardDescription>Crawler&apos;ın toplam çalıştırılma sayısı</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalRuns}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Toplam URL</CardTitle>
            <CardDescription>Bulunan toplam URL sayısı</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUrls}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Son Çalıştırma</CardTitle>
            <CardDescription>En son crawler çalıştırılma zamanı</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-sm">
              {stats.lastRun ? new Date(stats.lastRun).toLocaleString('tr-TR') : 'Henüz çalıştırılmamış'}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Komut Çıktıları</CardTitle>
            <CardDescription>Çalıştırılan komutların çıktılarını görüntüle</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/commands">
              <Button className="w-full">Görüntüle</Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Crawler Geçmişi</CardTitle>
            <CardDescription>Crawler çalıştırma geçmişini incele</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/history">
              <Button className="w-full">Görüntüle</Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>URL Tablosu</CardTitle>
            <CardDescription>Bulunan URL&apos;leri filtrele ve listele</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/urls">
              <Button className="w-full">Görüntüle</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
