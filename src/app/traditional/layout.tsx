import type React from "react"
import type {Metadata} from "next"
import {SearchProvider} from "@/lib/contexts/search-context"
import "./traditional.css"

export const metadata: Metadata = {
    title: "SeekeSphere Search Demo | Traditional Filter Search",
    description:
        "A demonstration of how filter based traditional search works",
}

export default function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode
}>) {
    return (
        <SearchProvider>
            <div className={`font-sans antialiased`}>
                {children}
            </div>
        </SearchProvider>
    )
}
