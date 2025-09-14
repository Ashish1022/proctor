"use client"

import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Trophy, Users, LogIn, UserPlus, Clock, Award } from "lucide-react"
import Image from "next/image"
import { useRouter } from "next/navigation"

export default function CollegeQuizHomePage() {
  const router = useRouter();
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-blue-50/50 to-purple-50/50">
      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Image src={'/logo.jpeg'} alt="logo" height={50} width={50} className="rounded-md"/>
              <h1 className="text-xl font-heading font-bold">ITSA</h1>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => router.push('/login')}>
                <LogIn className="w-4 h-4 mr-2" />
                Login
              </Button>
              <Button size="sm" className="bg-gradient-to-r from-blue-500 to-purple-600" onClick={() => router.push('/register')}>
                <UserPlus className="w-4 h-4 mr-2" />
                Register
              </Button>
            </div>
          </div>
        </div>
      </header>

      <section className="py-20 px-4">
        <div className="container mx-auto text-center max-w-4xl">
          <div className="mb-6">
            <span className="inline-block px-4 py-2 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 rounded-full text-sm font-medium mb-4">
              College Quiz Competition Platform
            </span>
          </div>
          <h1 className="text-5xl font-heading font-black mb-6 text-balance">
            Battle of Minds
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> Quiz Championship</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 text-pretty max-w-2xl mx-auto">
            Join the ultimate college quiz competition! Test your knowledge, compete with peers, and claim the champion's trophy.
          </p>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <h2 className="text-3xl font-heading font-bold text-center mb-12">Competition Features</h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <Card className="border-0 shadow-lg bg-background/80 backdrop-blur-sm hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500/10 to-blue-600/10 rounded-lg flex items-center justify-center mb-4">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <CardTitle className="font-heading">Team Registration</CardTitle>
                <CardDescription>Register your team or participate individually in various quiz categories</CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg bg-background/80 backdrop-blur-sm hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500/10 to-purple-600/10 rounded-lg flex items-center justify-center mb-4">
                  <Clock className="w-6 h-6 text-purple-600" />
                </div>
                <CardTitle className="font-heading">Live Competition</CardTitle>
                <CardDescription>
                  Real-time quiz battles with instant scoring and live leaderboards
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg bg-background/80 backdrop-blur-sm hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-br from-green-500/10 to-green-600/10 rounded-lg flex items-center justify-center mb-4">
                  <Award className="w-6 h-6 text-green-600" />
                </div>
                <CardTitle className="font-heading">Prizes & Rankings</CardTitle>
                <CardDescription>Win exciting prizes and get recognized on the hall of fame leaderboard</CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      <footer className="bg-gray-900 text-white py-6">
        <div className="container mx-auto px-4 text-center">
          <div className="text-gray-400 text-sm">
            © 2025 ITSA Committee. All rights reserved. • Built with ❤️
          </div>
        </div>
      </footer>
    </div>
  )
}