import { ImageBanner } from "@/features/image-banner";
import { Filter } from "@/features/filter";
import { RecentlyViewed } from "@/features/recently-viewed";
import { FlipCards } from "@/features/flip-cards";
import { SocialNetworks } from "@/features/social-networks";
import { ContactUs } from "@/features/contact-us";

export default function Home() {
  return (
    <main className="flex flex-col gap-20 min-h-screen ">

      <ImageBanner />

      <Filter />

      <RecentlyViewed />

      <FlipCards />

      <SocialNetworks />
        
      <ContactUs />

    </main>
  );
}
