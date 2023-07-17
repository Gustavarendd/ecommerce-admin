import prismadb from '@/lib/prismadb';
import { auth } from '@clerk/nextjs';

import { NextResponse } from 'next/server';

export async function DELETE(
  req: Request,
  {
    params,
  }: { params: { orderId: string; storeId: string; orderItemId: string } },
) {
  try {
    const { userId } = auth();

    if (!userId) {
      return new NextResponse('Unauthenticated', { status: 401 });
    }

    if (!params.orderItemId) {
      return new NextResponse('OrderItem ID is required', { status: 400 });
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

    const orderItem = await prismadb.orderItem.deleteMany({
      where: {
        id: params.orderItemId,
      },
    });

    return NextResponse.json(orderItem);
  } catch (error) {
    console.log('[ORDERITEM_DELETE]', error);
    return new NextResponse('Internal error', { status: 500 });
  }
}
