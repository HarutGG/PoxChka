import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { DashboardClient } from './DashboardClient';

export default async function DashboardPage() {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return redirect('/login');
    }

    const userFullName = user.user_metadata?.full_name;
    const userAvatarUrl = user.user_metadata?.avatar_url;
    const userEmail = user.email;
    const username = user.user_metadata?.username;

    return (
        <DashboardClient
            userFullName={userFullName}
            userEmail={userEmail}
            userAvatarUrl={userAvatarUrl}
            initialUsername={username}
        />
    );
}
