import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'

const loginSchema = z.object({
  email: z.string().trim().email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
})

// Simple inline SVG icons since lucide-react is not installed
const EyeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0" />
    <circle cx="12" cy="12" r="3" />
  </svg>
)

const EyeOffIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
    <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
    <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
    <line x1="2" x2="22" y1="2" y2="22" />
  </svg>
)

const SpinnerIcon = () => (
  <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white inline-block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
)

function LoginPage() {
  const navigate = useNavigate()
  const login = useAuthStore((s) => s.login)
  const [submitError, setSubmitError] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })



  const onLogin = async (values) => {
    setSubmitError('')
    setIsSubmitting(true)
    try {
      const user = await login(values)
      if (user?.role === 'INSTRUCTOR') navigate('/instructor/dashboard', { replace: true })
      else if (user?.role === 'STUDENT') navigate('/student/dashboard', { replace: true })
      else if (user?.role === 'ADMIN') navigate('/admin/dashboard', { replace: true })
      else navigate('/', { replace: true })
    } catch (error) {
      setSubmitError(error?.response?.data?.message || 'Login failed. Check your credentials and try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen w-full bg-white text-slate-900 lg:grid lg:grid-cols-[55%_45%]">
      <section className="relative flex min-h-[42vh] items-center justify-center overflow-hidden bg-[linear-gradient(135deg,#0f172a_0%,#1d4ed8_100%)] px-6 py-10 text-white sm:px-10 lg:min-h-screen lg:px-12 xl:px-16">
        <div aria-hidden="true" className="absolute left-[-8%] top-[-10%] h-[20rem] w-[20rem] rounded-full bg-sky-400/30 blur-[90px] [animation:float_10s_ease-in-out_infinite]" />
        <div aria-hidden="true" className="absolute right-[-10%] bottom-[-12%] h-[24rem] w-[24rem] rounded-full bg-blue-500/20 blur-[100px] [animation:floatReverse_13s_ease-in-out_infinite]" />
        <div aria-hidden="true" className="absolute left-[14%] top-[18%] h-44 w-44 rounded-full bg-cyan-300/20 blur-[90px] [animation:float_14s_ease-in-out_infinite]" />
        <div aria-hidden="true" className="absolute right-[18%] top-[52%] h-36 w-36 rounded-full bg-indigo-300/20 blur-[90px] [animation:floatReverse_16s_ease-in-out_infinite]" />

        <div className="relative z-10 flex w-full max-w-[560px] flex-col items-center text-center">
          <p className="text-[64px] font-extrabold leading-none tracking-[-0.05em] text-white">EduSphere</p>
          <p className="mt-4 text-[20px] font-medium text-[#93c5fd]">Learning Management System</p>
        </div>
        <p className="absolute bottom-8 left-8 text-sm text-slate-300/80">© 2025 EduSphere</p>
      </section>

      <section className="flex min-h-[58vh] items-center justify-center bg-white px-6 py-12 sm:px-10 lg:min-h-screen lg:px-12 xl:px-16">
        <div className="w-full max-w-[420px]">
          <div className="mb-8">
            <h2 className="text-[40px] font-bold tracking-[-0.04em] text-[#0f172a]">Welcome back</h2>
            <p className="mt-2 text-[16px] text-[#64748b]">Sign in to your account</p>
          </div>

          <form onSubmit={handleSubmit(onLogin)}>
            <div className="space-y-2">
              <label className="block text-[15px] font-medium text-slate-700">Email address</label>
              <input
                type="email"
                {...register('email')}
                placeholder="name@university.edu"
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-[14px] text-[16px] text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              />
              {errors.email && (
                <p className="text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            <div className="mt-5 space-y-2">
              <label className="block text-[15px] font-medium text-slate-700">Password</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  {...register('password')}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-[14px] pr-12 text-[16px] text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute inset-y-0 right-3 flex items-center text-slate-400 transition hover:text-slate-700"
                  aria-label={showPass ? 'Hide password' : 'Show password'}
                >
                  {showPass ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-[14px] text-[16px] font-semibold text-white transition-all duration-200 hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-600/25 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting ? (
                <>
                  <SpinnerIcon />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </button>

            {submitError && (
              <div className="mt-5 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
                {submitError}
              </div>
            )}
          </form>
        </div>
      </section>
    </div>
  )
}

export default LoginPage

