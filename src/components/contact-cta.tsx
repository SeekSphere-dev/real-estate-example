"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ArrowRight, Mail, Send } from "lucide-react"

export function ContactCta() {
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
  }

  return (
    <section id="contact" className="relative py-32">
      {/* Background glow */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute bottom-0 left-1/2 h-[600px] w-[800px] -translate-x-1/2 translate-y-1/2 rounded-full bg-primary/20 blur-[150px]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-6">
        <div className="rounded-3xl border border-primary/20 bg-card/50 p-8 backdrop-blur-xl md:p-16">
          <div className="grid gap-12 lg:grid-cols-2">
            {/* Left side - CTA content */}
            <div>
              <p className="mb-4 text-sm font-medium uppercase tracking-widest text-primary">Get Started</p>
              <h2 className="mb-6 text-balance text-4xl font-bold tracking-tight text-foreground md:text-5xl">
                Ready to transform your search experience?
              </h2>
              <p className="mb-8 text-pretty text-lg text-muted-foreground">
                Join the waitlist for early access or schedule a demo to see SeekSphere in action. We're building the
                future of intelligent search.
              </p>

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <Mail className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Email us directly</p>
                    <p className="text-sm text-muted-foreground">hello@seeksphere.ai</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right side - Contact form */}
            <div className="rounded-2xl border border-border bg-background/50 p-8">
              {submitted ? (
                <div className="flex h-full flex-col items-center justify-center text-center">
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/20">
                    <Send className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="mb-2 text-2xl font-semibold text-foreground">Thank you!</h3>
                  <p className="text-muted-foreground">We&apos;ll be in touch soon.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label htmlFor="name" className="mb-2 block text-sm font-medium text-foreground">
                        Name
                      </label>
                      <Input id="name" placeholder="John Doe" className="bg-secondary/50" required />
                    </div>
                    <div>
                      <label htmlFor="email" className="mb-2 block text-sm font-medium text-foreground">
                        Email
                      </label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="john@company.com"
                        className="bg-secondary/50"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="company" className="mb-2 block text-sm font-medium text-foreground">
                      Company
                    </label>
                    <Input id="company" placeholder="Your company name" className="bg-secondary/50" />
                  </div>
                  <div>
                    <label htmlFor="message" className="mb-2 block text-sm font-medium text-foreground">
                      Message
                    </label>
                    <Textarea
                      id="message"
                      placeholder="Tell us about your search needs..."
                      className="min-h-[120px] bg-secondary/50"
                      required
                    />
                  </div>
                  <Button type="submit" size="lg" className="group w-full gap-2">
                    <span>Send Message</span>
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
