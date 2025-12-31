// app/page.tsx (Next.js 13 App Router)
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export default function Home() {
  // Check for Better Auth JWT cookie
  const token = cookies().get('better_auth_token')?.value;

  if (token) {
    // User is authenticated → redirect to todos
    redirect('/todos');
  } else {
    // User is not authenticated → redirect to signin
    redirect('/signin');
  }

  // This will never actually render
  return null;
}
