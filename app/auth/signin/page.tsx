'use client'

import { useState } from 'react'
import { signIn, getSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { useToast } from '@/components/ui/use-toast'
import { Loader2, Mail } from 'lucide-react'
import { z } from 'zod'

const signinSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required')
})

type SigninFormData = z.infer<typeof signinSchema>

export default function SignInPage() {
  const [step, setStep] = useState<'form' | 'otp'>('form')
  const [signInMethod, setSignInMethod] = useState<'credentials' | 'otp'>('credentials')
  const [formData, setFormData] = useState<SigninFormData>({
    email: '',
    password: ''
  })
  const [otp, setOtp] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isEmailLoading, setIsEmailLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [otpExpiry, setOtpExpiry] = useState<Date | null>(null)
  const router = useRouter()
  const { toast } = useToast()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const validateForm = () => {
    try {
      signinSchema.parse(formData)
      setErrors({})
      return true
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {}
        error.errors.forEach((err) => {
          if (err.path[0]) {
            newErrors[err.path[0] as string] = err.message
          }
        })
        setErrors(newErrors)
      }
      return false
    }
  }

  const handleCredentialsSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }
    
    setIsLoading(true)

    try {
      const result = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false,
      })

      if (result?.error) {
        toast({
          title: "Error",
          description: "Invalid email or password",
          variant: "destructive"
        })
      } else {
        // Check if user is admin
        const session = await getSession()
        if ((session?.user as any)?.role === 'ADMIN') {
          router.push('/admin')
        } else {
          router.push('/dashboard')
        }
        
        toast({
          title: "Success",
          description: "Signed in successfully!",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleOtpSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.email) {
      setErrors({ email: 'Email is required' })
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          type: 'signin'
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setStep('otp')
        setOtpExpiry(new Date(data.expiresAt))
        toast({
          title: "Verification code sent!",
          description: "Please check your email for the 6-digit verification code.",
        })
      } else {
        toast({
          title: "Error",
          description: data.error || 'Failed to send verification code',
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Network error. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (otp.length !== 6) {
      toast({
        title: "Error",
        description: "Please enter a valid 6-digit code",
        variant: "destructive"
      })
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          otp,
          type: 'signin'
        }),
      })

      const data = await response.json()

      if (response.ok) {
        // Use NextAuth signIn with the token from OTP verification
        const result = await signIn('credentials', {
          email: formData.email,
          otpToken: data.token,
          redirect: false,
        })

        if (result?.error) {
          toast({
            title: "Error",
            description: "Failed to sign in",
            variant: "destructive"
          })
        } else {
          const session = await getSession()
          if ((session?.user as any)?.role === 'ADMIN') {
            router.push('/admin')
          } else {
            router.push('/dashboard')
          }
          
          toast({
            title: "Success",
            description: "Signed in successfully!",
          })
        }
      } else {
        toast({
          title: "Error",
          description: data.error || 'Invalid verification code',
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Network error. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleEmailSignIn = async () => {
    if (!formData.email) {
      setErrors({ email: 'Email is required' })
      return
    }

    setIsEmailLoading(true)

    try {
      const result = await signIn('email', {
        email: formData.email,
        redirect: false,
      })

      if (result?.error) {
        toast({
          title: "Error",
          description: "Failed to send sign-in link",
          variant: "destructive"
        })
      } else {
        toast({
          title: "Check your email",
          description: "A sign-in link has been sent to your email address.",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsEmailLoading(false)
    }
  }

  const resendOtp = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          type: 'signin'
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setOtpExpiry(new Date(data.expiresAt))
        toast({
          title: "Code resent!",
          description: "A new verification code has been sent to your email.",
        })
      } else {
        toast({
          title: "Error",
          description: data.error || 'Failed to resend code',
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Network error. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (step === 'otp') {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Mail className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Enter verification code</CardTitle>
              <CardDescription>
                We&apos;ve sent a 6-digit code to {formData.email}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <form onSubmit={handleOtpSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="otp">Verification Code</Label>
                  <Input
                    id="otp"
                    type="text"
                    placeholder="Enter 6-digit code"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    maxLength={6}
                    className="text-center text-lg tracking-widest"
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading || otp.length !== 6}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Verify & Sign In
                </Button>
              </form>
              
              <div className="text-center space-y-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={resendOtp}
                  disabled={isLoading}
                >
                  Resend code
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setStep('form')
                    setOtp('')
                  }}
                >
                  Back to sign in
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-md mx-auto">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Welcome back</CardTitle>
            <CardDescription>
              Sign in to your account to continue
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Sign In Method Toggle */}
            <div className="flex rounded-lg border p-1">
              <Button
                variant={signInMethod === 'credentials' ? 'default' : 'ghost'}
                size="sm"
                className="flex-1"
                onClick={() => setSignInMethod('credentials')}
              >
                Password
              </Button>
              <Button
                variant={signInMethod === 'otp' ? 'default' : 'ghost'}
                size="sm"
                className="flex-1"
                onClick={() => setSignInMethod('otp')}
              >
                Verification Code
              </Button>
            </div>

            {/* Email Input (always shown) */}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                className={errors.email ? 'border-red-500' : ''}
                required
              />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email}</p>
              )}
            </div>

            {signInMethod === 'credentials' ? (
              <>
                {/* Password Sign In */}
                <form onSubmit={handleCredentialsSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      placeholder="Enter your password"
                      value={formData.password}
                      onChange={handleChange}
                      className={errors.password ? 'border-red-500' : ''}
                      required
                    />
                    {errors.password && (
                      <p className="text-sm text-red-500">{errors.password}</p>
                    )}
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Sign in with Password
                  </Button>
                </form>

                <div className="text-center text-sm">
                  <Link href="/auth/forgot-password" className="text-primary hover:underline">
                    Forgot your password?
                  </Link>
                </div>
              </>
            ) : (
              <>
                {/* OTP Sign In */}
                <form onSubmit={handleOtpSignIn} className="space-y-4">
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Send Verification Code
                  </Button>
                </form>
              </>
            )}

            <Separator />

            {/* Magic Link Sign In */}
            <Button
              variant="outline"
              className="w-full"
              onClick={handleEmailSignIn}
              disabled={isEmailLoading}
            >
              {isEmailLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <Mail className="mr-2 h-4 w-4" />
              Send Magic Link
            </Button>

            <div className="text-center text-sm">
              Don&apos;t have an account?{" "}
              <Link href="/auth/signup" className="text-primary hover:underline">
                Sign up
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}