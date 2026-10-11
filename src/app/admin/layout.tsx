import React from 'react';
import { cookies } from 'next/headers';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { AdminLayoutClient } from './admin-layout-client';

export const metadata = {
  title: 'LUXE SHOP - Quản Trị Hệ Thống',
  description: 'Trang quản trị thương mại điện tử cao cấp LUXE SHOP',
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession(true);

  let currentUser = undefined;
  if (session && session.userId) {
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        avatar: true,
      },
    });

    if (user) {
      currentUser = {
        name: `${user.lastName} ${user.firstName}`.trim(),
        email: user.email,
      };
    }
  }

  return (
    <AdminLayoutClient currentUser={currentUser}>
      {children}
    </AdminLayoutClient>
  );
}
