import prismadb from '@/lib/prismadb';
import { OrderForm } from './components/order-form';
import { OrderItem, Product } from '@prisma/client';

const OrderPage = async ({
  params,
}: {
  params: { orderId: string; storeId: string };
}) => {
  const order = await prismadb.order.findUnique({
    where: {
      id: params.orderId,
    },
    include: {
      orderItems: {
        include: { product: true },
      },
    },
  });

  const orderItems = order!.orderItems.map(item => item.product!);

  const products = await prismadb.product.findMany({
    where: {
      storeId: params.storeId,
    },
  });

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <OrderForm
          initialData={order}
          itemsInOrder={orderItems}
          products={products}
        />
      </div>
    </div>
  );
};

export default OrderPage;
