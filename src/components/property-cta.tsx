"use client"

import type React from "react"

import { useState } from "react"
import { Calendar, Clock, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import type { PropertyDetail } from "@/lib/property-detail-data"

interface PropertyCTAProps {
    property: PropertyDetail
}

export function PropertyCTA({ property }: PropertyCTAProps) {
    const [submitted, setSubmitted] = useState(false)

    const formatPrice = (price: string) => {
        const num = Number.parseFloat(price)
        return new Intl.NumberFormat("en-CA", {
            style: "currency",
            currency: "CAD",
            maximumFractionDigits: 0,
        }).format(num)
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        setSubmitted(true)
        setTimeout(() => setSubmitted(false), 3000)
    }

    return (
        <div className="bg-card rounded-xl border border-border p-6">
            <div className="mb-4">
                <p className="text-sm text-muted-foreground">List Price</p>
                <p className="font-serif text-3xl font-semibold text-foreground">{formatPrice(property.listPrice)}</p>
                <p className="text-sm text-muted-foreground mt-1">
                    Est. {formatPrice((Number.parseFloat(property.listPrice) * 0.004).toString())}/month
                </p>
            </div>

            <Separator className="my-4" />

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <Label htmlFor="name" className="text-sm">
                        Full Name
                    </Label>
                    <Input id="name" placeholder="Your name" className="mt-1.5" required />
                </div>
                <div>
                    <Label htmlFor="email" className="text-sm">
                        Email
                    </Label>
                    <Input id="email" type="email" placeholder="your@email.com" className="mt-1.5" required />
                </div>
                <div>
                    <Label htmlFor="phone" className="text-sm">
                        Phone
                    </Label>
                    <Input id="phone" type="tel" placeholder="(555) 555-5555" className="mt-1.5" />
                </div>
                <div>
                    <Label htmlFor="message" className="text-sm">
                        Message
                    </Label>
                    <Textarea
                        id="message"
                        placeholder={`I'm interested in ${property.streetAddress}...`}
                        className="mt-1.5 resize-none"
                        rows={3}
                    />
                </div>

                <Button
                    type="submit"
                    className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
                    disabled={submitted}
                >
                    {submitted ? (
                        <>
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Message Sent!
                        </>
                    ) : (
                        "Request Information"
                    )}
                </Button>
            </form>

            <Separator className="my-4" />

            <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start bg-transparent">
                    <Calendar className="h-4 w-4 mr-2" />
                    Schedule a Tour
                </Button>
                <Button variant="outline" className="w-full justify-start bg-transparent">
                    <Clock className="h-4 w-4 mr-2" />
                    Request Video Tour
                </Button>
            </div>

            {property.availableDate && (
                <p className="text-xs text-muted-foreground text-center mt-4">
                    Available from {new Date(property.availableDate).toLocaleDateString()}
                </p>
            )}
        </div>
    )
}
