import Nav from "@/components/Nav";
import CreatorsHero from "@/components/creators/CreatorsHero";
import CreatorsProblem from "@/components/creators/CreatorsProblem";
import CreatorsSolution from "@/components/creators/CreatorsSolution";
import CreatorsFeatures from "@/components/creators/CreatorsFeatures";
import CreatorsCRM from "@/components/creators/CreatorsCRM";
import CreatorsUseCases from "@/components/creators/CreatorsUseCases";
import CreatorsPipeline from "@/components/creators/CreatorsPipeline";
import CreatorsTestimonials from "@/components/creators/CreatorsTestimonials";
import CreatorsComparison from "@/components/creators/CreatorsComparison";
import CreatorsFAQ from "@/components/creators/CreatorsFAQ";
import CreatorsCTA from "@/components/creators/CreatorsCTA";
import Footer from "@/components/Footer";

export const metadata = {
  title: "Tellero for Creators — Convert Instagram Comments Into Paying Clients",
  description:
    "Automatically capture leads from Instagram comments, move them into WhatsApp, nurture with automated follow-ups, and manage your pipeline from one dashboard.",
};

export default function CreatorsPage() {
  return (
    <main>
      <Nav />
      <CreatorsHero />
      <CreatorsProblem />
      <CreatorsSolution />
      <CreatorsFeatures />
      <CreatorsCRM />
      <CreatorsUseCases />
      <CreatorsPipeline />
      <CreatorsTestimonials />
      <CreatorsComparison />
      <CreatorsFAQ />
      <CreatorsCTA />
      <Footer />
    </main>
  );
}
