import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import Marquee from "@/components/Marquee";
import Metrics from "@/components/Metrics";
import FeatureTabs from "@/components/FeatureTabs";
import DashboardCallout from "@/components/DashboardCallout";
import Comparison from "@/components/Comparison";
import Testimonials from "@/components/Testimonials";
import Pricing from "@/components/Pricing";
import ROICalculator from "@/components/ROICalculator";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main>
      <Nav />
      <Hero />
      <Marquee />
      <Metrics />
      <FeatureTabs />
      <DashboardCallout />
      <Comparison />
      <Testimonials />
      <Pricing />
      <ROICalculator />
      <Footer />
    </main>
  );
}
