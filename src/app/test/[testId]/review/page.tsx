import TestResultsPageView from '@/modules/submission/ui/views/results-view';
import TestReviewPage from '@/modules/submission/ui/views/review-view';
import { caller, getQueryClient, trpc } from '@/trpc/server';
import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import React, { Suspense } from 'react'

interface Props {
  params: Promise<{ testId: string }>
}

const ReviewPage = async ({ params }: Props) => {
  const { testId } = await params;
  const queryClient = getQueryClient();

  const session = await caller.auth.session();
  const user = session.user;

  void queryClient.prefetchQuery(trpc.submission.getResults.queryOptions({ testId: testId, studentId: user!.id }));

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense fallback={'loading'}>
        <TestReviewPage testId={testId} userId={user!.id} />
      </Suspense>
    </HydrationBoundary>
  )
}

export default ReviewPage