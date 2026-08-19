'use client';

import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

export function Card({ children, className = '', ...props }: CardProps) {
  return (
    <div
      className={`p-5 bg-white rounded-2xl border border-slate-200 shadow-xs ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

export function CardHeader({ children, className = '', ...props }: CardHeaderProps) {
  return (
    <div
      className={`flex items-center justify-between border-b border-slate-100 pb-3 mb-4 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  children: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
}

export function CardTitle({ children, icon, className = '', ...props }: CardTitleProps) {
  return (
    <h3
      className={`flex items-center gap-2 text-slate-900 font-extrabold text-base ${className}`}
      {...props}
    >
      {icon}
      <span>{children}</span>
    </h3>
  );
}

export interface CardDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {
  children: React.ReactNode;
  className?: string;
}

export function CardDescription({ children, className = '', ...props }: CardDescriptionProps) {
  return (
    <p className={`text-xs text-slate-500 mt-0.5 ${className}`} {...props}>
      {children}
    </p>
  );
}

export interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

export function CardContent({ children, className = '', ...props }: CardContentProps) {
  return (
    <div className={className} {...props}>
      {children}
    </div>
  );
}
