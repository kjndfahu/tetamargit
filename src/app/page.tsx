import { ImageBanner } from "@/features/image-banner";
import { Store3D } from "@/features/store-3d-fallback";
import { Filter } from "@/features/filter";
import { RecentlyViewed } from "@/features/recently-viewed";
import { FlipCards } from "@/features/flip-cards";
import { SocialNetworks } from "@/features/social-networks";
import { ContactUs } from "@/features/contact-us";
import { Competitions } from "@/features/competitions";

export default function Home() {
  return (
    <main className="flex flex-col gap-20 min-h-screen ">

      <ImageBanner />

      <Store3D />

      <Filter />

      <RecentlyViewed />

      <FlipCards />

      <SocialNetworks />

      <Competitions />
        
      <ContactUs />

    </main>
  );
}
