"use client";

import { useTRPC } from '@/trpc/client';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export const useCreateTest = () => {
    const trpc = useTRPC();
    const router = useRouter();

    const createTestMutation = useMutation(trpc.test.create.mutationOptions({
        onError: (error) => {
            toast.error(error.message);
            console.log(error.message)
        },
        onSuccess: (data) => {
            toast.success("Test created successfully!");
            router.push(`/admin/tests/${data!.testId}`);
        }
    }));

    const publishTestMutation = useMutation(trpc.test.publish.mutationOptions({
        onError: (error) => {
            toast.error(error.message);
        },
        onSuccess: () => {
            toast.success("Test published successfully!");
        }
    }));

    return {
        createTest: createTestMutation.mutate,
        publishTest: publishTestMutation.mutate,
        isCreating: createTestMutation.isPending,
        isPublishing: publishTestMutation.isPending,
    };
};