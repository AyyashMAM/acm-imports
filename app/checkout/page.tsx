import { getMyProfile } from "@/lib/account/profile-data";
import { getMyAddresses } from "@/lib/account/addresses-data";
import { CheckoutForm } from "@/components/checkout-form";

export default async function CheckoutPage() {
  const [profile, addresses] = await Promise.all([getMyProfile(), getMyAddresses()]);

  return <CheckoutForm profile={profile} addresses={addresses} />;
}
