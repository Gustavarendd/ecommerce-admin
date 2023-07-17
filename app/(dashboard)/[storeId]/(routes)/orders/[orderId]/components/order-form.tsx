'use client';

import axios from 'axios';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Order, OrderItem, Product } from '@prisma/client';
import { useForm } from 'react-hook-form';
import { Trash } from 'lucide-react';
import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';

import { Heading } from '@/components/ui/heading';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { AlertModal } from '@/components/modals/alert-modal';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const formSchema = z.object({
  address: z.string().min(1),
  phone: z.string().min(1),
  orderItems: z.object({ id: z.string() }).array(),
  // products: z.object({ productId: z.string() }).array(),
});
type OrderFormValues = z.infer<typeof formSchema>;

interface OrderFormProps {
  initialData: (Order & { orderItems: OrderItem[] }) | null;

  itemsInOrder: Product[];
  products: Product[];
}

export const OrderForm = ({
  initialData,
  itemsInOrder,
  products,
}: OrderFormProps) => {
  const params = useParams();
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [openProductDelete, setOpenProductDelete] = useState(false);
  const [orderItemID, setOrderItemID] = useState('');
  const [loading, setLoading] = useState(false);

  const title = initialData ? 'Edit Order' : 'Create Order';
  const description = initialData ? 'Edit a order' : 'Create a new order';
  const toastMessage = initialData
    ? 'Order updated successfully'
    : 'Order created successfully';
  const action = initialData ? 'Save Changes' : 'Create';

  const form = useForm<OrderFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
      address: '',
      phone: '',
      orderItems: [],
      // orderItems: [],
      // products: [],
    },
  });

  const onSubmit = async (data: OrderFormValues) => {
    try {
      setLoading(true);
      if (initialData) {
        await axios.patch(
          `/api/${params.storeId}/orders/${params.orderId}`,
          data,
        );
      } else {
        await axios.post(`/api/${params.storeId}/orders`, data);
      }
      router.refresh();
      router.push(`/${params.storeId}/orders`);
      toast.success(toastMessage);
    } catch (error) {
      toast.error('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const onDelete = async () => {
    try {
      setLoading(true);
      await axios.delete(`/api/${params.storeId}/orders/${params.orderId}`);
      router.refresh();
      router.push(`/${params.storeId}/orders`);
      toast.success('Order deleted successfully');
    } catch (error) {
      toast.error('Something went wrong');
    } finally {
      setLoading(false);
      setOpen(false);
    }
  };

  const onDeleteProduct = async () => {
    console.log(orderItemID);
    try {
      setLoading(true);
      await axios.delete(
        `/api/${params.storeId}/orders/${params.orderId}/${orderItemID}`,
      );
      router.refresh();

      toast.success('Product deleted successfully');
    } catch (error) {
      toast.error('Something went wrong');
    } finally {
      setLoading(false);
      setOpen(false);
    }
  };

  return (
    <>
      <AlertModal
        isOpen={open}
        onClose={() => setOpen(false)}
        onConfirm={onDelete}
        loading={loading}
      />
      <AlertModal
        isOpen={openProductDelete}
        onClose={() => setOpenProductDelete(false)}
        onConfirm={onDeleteProduct}
        loading={loading}
      />
      <div className="flex items-center justify-between">
        <Heading
          title={title}
          description={description}
        />
        {initialData && (
          <Button
            disabled={loading}
            variant={'destructive'}
            size={'icon'}
            onClick={() => setOpen(true)}
          >
            <Trash className="h-4 w-4" />
          </Button>
        )}
      </div>
      <Separator />
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-8 w-full"
        >
          <div className="grid grid-cols-3 gap-8">
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address</FormLabel>
                  <FormControl>
                    <Input
                      disabled={loading}
                      {...field}
                      placeholder="Address"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone number</FormLabel>
                  <FormControl>
                    <Input
                      disabled={loading}
                      {...field}
                      placeholder="+420 256 654 854"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* <FormField
              control={form.control}
              name="orderItems"
              render={({ field[0] }) => (
                <FormItem>
                  <FormLabel>Products</FormLabel>
                  {itemsInOrder.map(item => (
                    <div key={item.id}>
                      <Select
                        disabled={loading}
                        onValueChange={field.onChange}
                        value={field.value[0]}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue
                              defaultValue={field.value}
                              placeholder="Select a Product"
                            />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {products.map(product => (
                            <SelectItem
                              key={product.id}
                              value={product.id}
                            >
                              {product.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  ))}
                  <FormMessage />
                </FormItem>
              )}
            /> */}
          </div>
          <div>
            <h3 className="font-semibold text-sm">Products</h3>
            {itemsInOrder?.map(item => (
              <div
                key={item.id}
                className="mt-4 flex justify-between border rounded-md p-1 pl-4 items-center"
              >
                {`${item.name}, ${item.id}`}
                <Button
                  type="button"
                  disabled={loading}
                  variant={'destructive'}
                  size={'icon'}
                  onClick={() => {
                    const ID = initialData?.orderItems.filter(
                      orderItem => orderItem.productId === item.id,
                    );
                    setOrderItemID(ID![0].id);
                    console.log(ID![0].id);

                    setOpenProductDelete(true);
                  }}
                >
                  <Trash className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
          <Button
            disabled={loading}
            type="submit"
            className="ml-auto"
          >
            {action}
          </Button>
        </form>
      </Form>
    </>
  );
};
