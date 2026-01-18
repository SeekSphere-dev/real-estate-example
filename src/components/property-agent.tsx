"use client"

import Image from "next/image"
import { Star, Phone, Mail, Award, MessageSquare } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

interface Agent {
    id: number
    firstName: string
    lastName: string
    email: string
    phone: string
    licenseNumber: string
    agencyName: string
    yearsExperience: number
    rating: string
    totalReviews: number
}

interface PropertyAgentProps {
    agent: Agent | null
}

export function PropertyAgent({ agent }: PropertyAgentProps) {
    // Handle null agent
    if (!agent || !agent.firstName) {
        return (
            <div className="bg-card rounded-xl border border-border p-6">
                <h2 className="font-semibold text-lg text-foreground mb-4">Listed By</h2>
                <p className="text-muted-foreground text-sm">Agent information not available</p>
            </div>
        )
    }

    return (
        <div className="bg-card rounded-xl border border-border p-6">
            <h2 className="font-semibold text-lg text-foreground mb-4">Listed By</h2>

            <div className="flex items-start gap-4">
                <div className="relative w-16 h-16 rounded-full overflow-hidden bg-secondary shrink-0">
                    <Image
                        src={`/placeholder.svg?height=64&width=64&query=professional real estate agent portrait`}
                        alt={`${agent.firstName} ${agent.lastName}`}
                        fill
                        className="object-cover"
                    />
                </div>
                <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground">
                        {agent.firstName} {agent.lastName}
                    </h3>
                    <p className="text-sm text-muted-foreground">{agent.agencyName}</p>
                    <div className="flex items-center gap-1 mt-1">
                        <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                        <span className="text-sm font-medium">{agent.rating}</span>
                        <span className="text-sm text-muted-foreground">({agent.totalReviews} reviews)</span>
                    </div>
                </div>
            </div>

            <Separator className="my-4" />

            <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                    <Award className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span className="text-muted-foreground">Experience:</span>
                    <span className="font-medium">{agent.yearsExperience} years</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                    <Award className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span className="text-muted-foreground">License:</span>
                    <span className="font-medium">{agent.licenseNumber}</span>
                </div>
            </div>

            <Separator className="my-4" />

            <div className="space-y-2">
                <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Send Message
                </Button>
                <Button variant="outline" className="w-full bg-transparent">
                    <Phone className="h-4 w-4 mr-2" />
                    {agent.phone}
                </Button>
                <Button variant="ghost" className="w-full text-muted-foreground">
                    <Mail className="h-4 w-4 mr-2" />
                    {agent.email}
                </Button>
            </div>
        </div>
    )
}
