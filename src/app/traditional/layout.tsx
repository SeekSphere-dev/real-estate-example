import type React from "react"
import type { Metadata } from "next"
import { Inter, Playfair_Display } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./traditional.css"

const _inter = Inter({ subsets: ["latin"] })
const _playfair = Playfair_Display({ subsets: ["latin"] })

export const metadata: Metadata = {
    title: "Prestige Properties | Find Your Dream Home",
    description:
        "Discover luxury real estate listings with Prestige Properties. Browse houses, condos, and apartments for sale and rent.",
}

export default function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode
}>) {
    return (
        <div className={`font-sans antialiased`}>
            {children}
        </div>
    )
}
