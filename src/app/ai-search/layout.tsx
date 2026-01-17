import type React from "react";
import type {Metadata} from "next";

export const metadata: Metadata = {
    title: "SeekeSphere Search Demo | AI Search",
    description:
        "Search through a huge catalogue of properties using nothing but NLP",
}

export default function Layout({ children }: Readonly<{
    children: React.ReactNode
}>) {
    return <>
        {children}
    </>
}
