import StudentDashboard from '@/modules/student/ui/views/student-dashboard-view';
import { caller } from '@/trpc/server'
import { redirect } from 'next/navigation';
import React, { Suspense } from 'react'

export const dynamic = "force-dynamic"

const StudentPage = async () => {

  const session = await caller.auth.session();
  const user = session.user;

  if (!session.user) redirect('/login')

  return (
    <Suspense>
      <StudentDashboard year={user!.year} userId={user!.id} name={user!.firstname}/>
    </Suspense>
  )
}

export default StudentPage