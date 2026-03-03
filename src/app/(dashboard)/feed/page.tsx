import { auth } from '@clerk/nextjs/server'
import { createSupabaseClient } from '@/lib/supabase/client'
import CreatePostForm from './components/CreatePostForm'
import FeedPostCard from './components/FeedPostCard'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function FeedPage() {
    const { userId, getToken } = await auth()

    if (!userId) {
        redirect('/sign-in')
    }

    const token = await getToken({ template: "supabase" })
    const supabase = createSupabaseClient(token || "")

    // Fetch Posts
    const { data: posts, error } = await supabase
        .from('posts')
        .select('*, users(*), likes(user_id), comments(*, users(*), likes(user_id))')
        .order('created_at', { ascending: false })

    if (error) {
        console.error(error)
    }

    return (
        <div className="animate-in fade-in duration-500">
            <div className="mb-6 flex justify-between items-end">
                <div>
                    <h1 className="text-2xl font-bold text-[#0055ff]">Social Feed</h1>
                    <p className="text-sm text-gray-500 mt-1">Discover insights, read debate summaries, and connect.</p>
                </div>

                <CreatePostForm />
            </div>

            <div className="space-y-4">
                {posts?.length === 0 && (
                    <div className="text-center text-sm text-gray-500 py-6 font-medium bg-white rounded-2xl border border-dashed border-gray-200">
                        No posts yet. Be the first to share an insight!
                    </div>
                )}

                {posts?.map((post: any) => (
                    <FeedPostCard key={post.id} post={post} currentUserId={userId} />
                ))}

                <div className="text-center text-xs text-gray-400 py-6 border-t border-gray-100 mt-8 font-medium">
                    You caught up! Wait for new intellectual inputs.
                </div>
            </div>
        </div>
    )
}
