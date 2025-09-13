import EditTestPageView from '@/modules/test/ui/views/edit-test-view';
import { getQueryClient, trpc } from '@/trpc/server';
import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import React from 'react'

interface Props {
    params: Promise<{ testId: string }>
}

const EditTestPage = async ({ params }: Props) => {
    const { testId } = await params;
    const queryClient = getQueryClient();

    void queryClient.prefetchQuery(trpc.test.getById.queryOptions({ id: testId }));

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <EditTestPageView testId={testId} />
        </HydrationBoundary>
    )
}

export default EditTestPage