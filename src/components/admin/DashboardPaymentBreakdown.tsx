'use client';

import React from 'react';
import { CreditCard, Banknote, QrCode } from 'lucide-react';
import { formatRupiah } from '@/lib/utils';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';

interface DashboardPaymentBreakdownProps {
  cashSales: number;
  qrisSales: number;
  cashPercent: number;
  qrisPercent: number;
}

export function DashboardPaymentBreakdown({
  cashSales,
  qrisSales,
  cashPercent,
  qrisPercent,
}: DashboardPaymentBreakdownProps) {
  const total = cashSales + qrisSales;
  const radius = 38;
  const circumference = 2 * Math.PI * radius; // ~238.76

  const cashOffset = 0;
  const cashLength = (cashPercent / 100) * circumference;
  const qrisOffset = -cashLength;
  const qrisLength = (qrisPercent / 100) * circumference;

  return (
    <Card className="flex flex-col justify-between">
      <div>
        <CardHeader>
          <CardTitle icon={<CreditCard className="w-5 h-5 text-blue-600" />}>
            Metode Pembayaran
          </CardTitle>
          <span className="text-xs font-mono font-bold text-slate-500">
            {formatRupiah(total)}
          </span>
        </CardHeader>
        <CardDescription className="-mt-2 mb-4">
          Proporsi pembayaran tunai kasir vs QRIS digital
        </CardDescription>

        {/* Donut Chart Visual & Legend */}
        <div className="flex items-center gap-5 mt-5">
          {/* SVG Donut */}
          <div className="relative w-24 h-24 shrink-0 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              {/* Background ring */}
              <circle
                cx="50"
                cy="50"
                r={radius}
                className="stroke-slate-100"
                strokeWidth="12"
                fill="transparent"
              />
              {total > 0 && (
                <>
                  {/* Cash segment (Emerald) */}
                  <circle
                    cx="50"
                    cy="50"
                    r={radius}
                    className="stroke-emerald-500 transition-all duration-700"
                    strokeWidth="12"
                    strokeDasharray={`${cashLength} ${circumference}`}
                    strokeDashoffset={cashOffset}
                    strokeLinecap="round"
                    fill="transparent"
                  />
                  {/* QRIS segment (Blue) */}
                  <circle
                    cx="50"
                    cy="50"
                    r={radius}
                    className="stroke-blue-600 transition-all duration-700"
                    strokeWidth="12"
                    strokeDasharray={`${qrisLength} ${circumference}`}
                    strokeDashoffset={qrisOffset}
                    strokeLinecap="round"
                    fill="transparent"
                  />
                </>
              )}
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-[11px] font-bold text-slate-400 uppercase leading-none">TOTAL</span>
              <span className="text-xs font-black font-mono text-slate-900 leading-tight">
                {total > 0 ? `${(cashPercent).toFixed(0)}%` : '0%'}
              </span>
            </div>
          </div>

          {/* Detailed Legend */}
          <div className="flex-1 space-y-2.5 text-xs">
            {/* Cash */}
            <div>
              <div className="flex items-center justify-between font-bold">
                <span className="flex items-center gap-1.5 text-slate-700">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block shrink-0" />
                  <Banknote className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Tunai (Cash)</span>
                </span>
                <span className="font-mono text-emerald-700">{cashPercent.toFixed(0)}%</span>
              </div>
              <div className="text-[11px] font-mono text-slate-400 pl-4 mt-0.5">
                {formatRupiah(cashSales)}
              </div>
            </div>

            {/* QRIS */}
            <div>
              <div className="flex items-center justify-between font-bold">
                <span className="flex items-center gap-1.5 text-slate-700">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-600 inline-block shrink-0" />
                  <QrCode className="w-3.5 h-3.5 text-blue-600" />
                  <span>QRIS Digital</span>
                </span>
                <span className="font-mono text-blue-700">{qrisPercent.toFixed(0)}%</span>
              </div>
              <div className="text-[11px] font-mono text-slate-400 pl-4 mt-0.5">
                {formatRupiah(qrisSales)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
