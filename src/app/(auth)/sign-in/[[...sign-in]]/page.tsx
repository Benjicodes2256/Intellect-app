import { ClerkProvider, SignIn } from '@clerk/nextjs'

export default function Page() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-white p-4">
            <div className="flex flex-col items-center gap-8 w-full max-w-sm">
                {/* Placeholder for Logo, will be replaced with real logo later */}
                <div className="text-[#0055ff] text-2xl font-bold tracking-tight">
                    iNTEL<span className="text-[#ff5500]">lect</span>
                </div>
                <SignIn routing="path" path="/sign-in" signUpUrl="/sign-up" forceRedirectUrl="/onboarding" />
            </div>
        </div>
    )
}
