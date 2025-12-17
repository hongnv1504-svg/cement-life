import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseKey);

export const updateOrderStatus = async (
  orderId: number,
  newStatus: "PENDING" | "COMPLETED" | "CANCELED"
) => {
  const { data, error } = await supabase
    .from("orders")
    .update({ status: newStatus })
    .eq("id", orderId)
    .select();
  if (error) {
    console.error("Error updating order status:", error);
    return null;
  }
  return data;
};

