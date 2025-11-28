import { Navbar } from "@/components/navbar"
import { Hero } from "@/components/hero"
import { HowItWorks } from "@/components/how-it-works"
import { WhySeekSphere } from "@/components/why-seeksphere"
import { ContactCta } from "@/components/contact-cta"
import { Footer } from "@/components/footer"

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <Hero />
      <HowItWorks />
      <WhySeekSphere />
      <ContactCta />
      <Footer />
    </main>
  )
}
