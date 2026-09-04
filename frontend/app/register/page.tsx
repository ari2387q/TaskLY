"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { Label } from "@/components/ui/label"
import { Rocket, Eye, EyeOff, ArrowLeft } from "lucide-react"

export default function RegisterPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  })

  const { register } = useAuth()
  const { toast } = useToast()
  const router = useRouter()

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!formData.name || !formData.email || !formData.password) {
      toast({
        variant: "destructive",
        title: "Missing fields",
        description: "Please fill in all required fields.",
      })
      return
    }

    if (formData.password !== formData.confirmPassword) {
      toast({
        variant: "destructive",
        title: "Passwords mismatch",
        description: "Your passwords do not match.",
      })
      return
    }

    setIsLoading(true)
    try {
      await register(formData.email, formData.password, formData.name)
      toast({
        title: "Account created!",
        description: "Welcome to TaskLY.",
      })
      router.push("/login")
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Registration failed",
        description: error.message || "Something went wrong. Please try again.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignUp = () => {
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/google`
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-background relative overflow-hidden">
      {/* Decorative Orbs */}
      <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] rounded-full bg-primary/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] rounded-full bg-secondary/10 blur-[120px] pointer-events-none" />

      {/* Back to Home */}
      <Link
        href="/"
        className="absolute top-5 left-5 z-20 flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors font-medium"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Home
      </Link>

      {/* Left: Branding */}
      <div className="hidden md:flex w-1/2 bg-gradient-to-br from-primary/10 via-background to-secondary/5 text-foreground items-center justify-center p-12 border-r border-border">
        <div className="max-w-md space-y-6">
          <div className="inline-flex p-3 rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
            <Rocket className="h-8 w-8 animate-bounce" />
          </div>
          <h1 className="text-5xl font-black tracking-tight leading-none">
            Join <span className="text-primary">TaskLY</span>
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Collaborate on workspaces, track tasks, and build momentum with your team.
          </p>
        </div>
      </div>

      {/* Right: Register Card */}
      <div className="flex w-full md:w-1/2 items-center justify-center p-6 z-10">
        <div className="w-full max-w-md">
          <Card className="rounded-3xl border border-border dark:border-primary/10 bg-card/60 backdrop-blur-md shadow-2xl hover:shadow-primary/5 transition-all duration-500">
            <CardHeader className="space-y-2 pb-4">
              <CardTitle className="text-3xl font-black text-center tracking-tight">Create account</CardTitle>
              <CardDescription className="text-center font-medium text-muted-foreground">
                Start tracking your skills today
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-5">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="font-bold text-xs uppercase tracking-wider text-muted-foreground ml-1">Full Name</Label>
                    <Input
                      id="name"
                      name="name"
                      placeholder="John Doe"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="rounded-full px-5 py-3 h-11 border-border bg-background"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="font-bold text-xs uppercase tracking-wider text-muted-foreground ml-1">Email Address</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="name@example.com"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="rounded-full px-5 py-3 h-11 border-border bg-background"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password" className="font-bold text-xs uppercase tracking-wider text-muted-foreground ml-1">Password</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={formData.password}
                        onChange={handleInputChange}
                        required
                        className="rounded-full px-5 py-3 h-11 border-border bg-background pr-12"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((p) => !p)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        tabIndex={-1}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="font-bold text-xs uppercase tracking-wider text-muted-foreground ml-1">Confirm Password</Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        required
                        className="rounded-full px-5 py-3 h-11 border-border bg-background pr-12"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword((p) => !p)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        tabIndex={-1}
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  <Button type="submit" className="w-full rounded-full h-11 font-bold shadow-lg shadow-primary/15 hover:scale-[1.01] active:scale-[0.99] transition-all duration-350 mt-2" disabled={isLoading}>
                    {isLoading ? "Creating account..." : "Create account"}
                  </Button>
                </form>

                <div className="relative py-2">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-border" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase tracking-widest">
                    <span className="bg-card px-3 text-muted-foreground font-bold">Or</span>
                  </div>
                </div>

                <Button variant="outline" className="w-full rounded-full h-11 font-bold flex items-center justify-center gap-3 hover:bg-muted transition-all duration-300 hover:scale-[1.01] active:scale-[0.99]" onClick={handleGoogleSignUp}>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="h-5 w-5">
                    <path fill="#4285F4" d="M24 9.5c3.54 0 6.45 1.22 8.39 2.83l6.24-6.24C34.6 2.08 29.66 0 24 0 14.73 0 6.95 5.79 3.54 13.9l7.43 5.77C12.98 14.02 18.98 9.5 24 9.5z"/>
                    <path fill="#34A853" d="M46.45 24.5c0-1.6-.14-2.8-.44-4.03H24v8.03h12.63c-.54 2.9-2.33 5.34-4.97 6.98l7.6 5.9C44.97 38.1 46.45 31.7 46.45 24.5z"/>
                    <path fill="#FBBC05" d="M11.0 29.67A14.98 14.98 0 0 1 9.32 24c0-1.34.2-2.64.56-3.86L3.54 14.9C1.2 19.87 0 24.97 0 30.16c0 5.3 1.2 10.4 3.54 15.37l7.43-5.77c-.53-1.8-.97-3.62-.97-5.09z"/>
                    <path fill="#EA4335" d="M24 48c6.48 0 11.91-2.15 15.88-5.86l-7.6-5.9c-2.14 1.44-4.89 2.3-8.28 2.3-5.02 0-11.02-4.52-12.92-10.27l-7.43 5.77C6.95 42.21 14.73 48 24 48z"/>
                  </svg>
                  Sign up with Google
                </Button>
              </div>
            </CardContent>
            <CardFooter className="pt-2">
              <div className="text-sm text-center text-muted-foreground w-full font-medium">
                Already have an account?{" "}
                <Link href="/login" className="text-primary hover:underline underline-offset-4 font-bold">
                  Sign in
                </Link>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}
