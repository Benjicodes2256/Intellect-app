import { SignUp } from '@clerk/nextjs'

export default function Page() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-white p-4">
            <div className="flex flex-col items-center gap-8 w-full max-w-sm">
                <div className="text-[#0055ff] text-2xl font-bold tracking-tight">
                    iNTEL<span className="text-[#ff5500]">lect</span>
                </div>
                <SignUp routing="path" path="/sign-up" signInUrl="/sign-in" forceRedirectUrl="/onboarding" />
            </div>
        </div>
    )
}
