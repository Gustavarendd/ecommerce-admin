import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs';

import prismadb from '@/lib/prismadb';

export async function POST(
  req: Request,
  { params }: { params: { storeId: string } },
) {
  try {
    const { userId } = auth();
    const body = await req.json();

    const { address, phone } = body;

    if (!userId) {
      return new NextResponse('Unauthenticated', { status: 401 });
    }
    if (!address) {
      return new NextResponse('Address is required', { status: 400 });
    }
    if (!phone) {
      return new NextResponse('Phone is required', { status: 400 });
    }

    if (!params.storeId) {
      return new NextResponse('Store Id is required', { status: 400 });
    }

    const storeByUserId = await prismadb.store.findFirst({
      where: {
        id: params.storeId,
        userId,
      },
    });

    if (!storeByUserId) {
      return new NextResponse('Unauthorized', { status: 403 });
    }

    const order = await prismadb.order.create({
      data: {
        address,
        phone,
        storeId: params.storeId,
      },
    });

    return NextResponse.json(order);
  } catch (error) {
    console.log('[ORDERS_POST]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function GET(
  req: Request,
  { params }: { params: { storeId: string } },
) {
  try {
    if (!params.storeId) {
      return new NextResponse('Store Id is required', { status: 400 });
    }

    const orders = await prismadb.order.findMany({
      where: {
        storeId: params.storeId,
      },
    });

    return NextResponse.json(orders);
  } catch (error) {
    console.log('[ORDER_GET]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
