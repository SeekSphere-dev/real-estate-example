"use client"
import { useState } from "react"
import { Search, Menu, X, Heart, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"

export function Header() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const [searchValue, setSearchValue] = useState("")
    const fetchData = async () => {
        try {
          const response = await fetch(`/api/search?q=${encodeURIComponent(searchValue)}`)
          if (!response.ok) {
            throw new Error('Search failed')
          }
          const data = await response.json()
          console.log(data)
          // Handle the data here (e.g., update state, navigate, etc.)
        } catch (error) {
          console.error('Error fetching data:', error)
        }
      }

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        fetchData();
    }

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchValue(e.target.value)
    }

    return (
        <header className="sticky top-0 z-50 bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80 border-b border-border">
            <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16 lg:h-20">
                    {/* Logo */}
                    <Link href="/ai-search">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-primary rounded-sm flex items-center justify-center">
                                <span className="text-primary-foreground font-serif font-bold text-lg">P</span>
                            </div>
                            <span className="font-serif text-xl font-semibold tracking-tight text-foreground">Prestige</span>
                        </div>
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden lg:flex items-center gap-8">
                        <a href="#" className="text-sm font-medium text-foreground hover:text-accent transition-colors">
                            Buy
                        </a>
                        <a href="#" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                            Rent
                        </a>
                        <a href="#" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                            Sell
                        </a>
                        <a href="#" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                            Agents
                        </a>
                    </nav>

                    {/* Search Bar - Desktop */}
                    <div className="hidden md:flex items-center flex-1 max-w-md mx-8">
                        <form onSubmit={handleSearchSubmit} className="relative w-full">
                            <img src="/seeksphere-White.svg" className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4"/>
                            <Input
                                type="search"
                                placeholder="Search property titles..."
                                value={searchValue}
                                onChange={handleSearchChange}
                                className="pl-10 pr-4 h-10 bg-secondary border-2 border-blue-400 rounded-4xl focus-visible:ring-1 focus-visible:ring-accent"
                            />
                        </form>
                    </div>

                    {/* Right Actions */}
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" className="hidden sm:flex">
                            <Heart className="h-5 w-5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="hidden sm:flex">
                            <User className="h-5 w-5" />
                        </Button>
                        <Button className="hidden sm:flex bg-primary hover:bg-primary/90 text-primary-foreground">
                            List Property
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="lg:hidden"
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        >
                            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                        </Button>
                    </div>
                </div>

                {/* Mobile Search */}
                <div className="md:hidden pb-4">
                    <form onSubmit={handleSearchSubmit} className="relative w-full">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            type="search"
                            placeholder="Search property titles..."
                            value={searchValue}
                            onChange={handleSearchChange}
                            onSubmit={(e) => {
                                fetchData();
                            }}
                            className="pl-10 pr-4 h-10 bg-secondary border-0"
                        />
                    </form>
                </div>
            </div>

            {/* Mobile Menu */}
            {mobileMenuOpen && (
                <div className="lg:hidden border-t border-border bg-card">
                    <nav className="flex flex-col py-4 px-4 sm:px-6 gap-2">
                        <a href="#" className="px-4 py-2 text-sm font-medium text-foreground bg-secondary rounded-md">
                            Buy
                        </a>
                        <a href="#" className="px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-secondary rounded-md">
                            Rent
                        </a>
                        <a href="#" className="px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-secondary rounded-md">
                            Sell
                        </a>
                        <a href="#" className="px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-secondary rounded-md">
                            Agents
                        </a>
                        <div className="flex items-center gap-2 pt-2 border-t border-border mt-2">
                            <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                                <Heart className="h-4 w-4 mr-2" /> Saved
                            </Button>
                            <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                                <User className="h-4 w-4 mr-2" /> Sign In
                            </Button>
                        </div>
                        <Button className="mt-2 bg-primary hover:bg-primary/90 text-primary-foreground">List Property</Button>
                    </nav>
                </div>
            )}
        </header>
    )
}
