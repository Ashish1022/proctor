import TestPage from '@/modules/test/ui/views/student-text-view';
import { caller, getQueryClient, trpc } from '@/trpc/server';
import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { redirect } from 'next/navigation';
import React, { Suspense } from 'react'

interface Props {
    params: Promise<{ testId: string }>
}

const StudentsTestView = async ({ params }: Props) => {

    const { testId } = await params;
    const queryClient = getQueryClient();

    const session = await caller.auth.session();
    const user = session.user;

    if (!user) redirect('/login');

    void queryClient.prefetchQuery(trpc.test.getById.queryOptions({ id: testId }));

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <Suspense fallback={'loading'}>
                <TestPage testId={testId} userId={user?.id} />
            </Suspense>
        </HydrationBoundary>
    )
}

export default StudentsTestView