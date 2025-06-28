
import React from 'react';
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export const InviteScreenSkeleton = () => {
  return (
    <div className="p-4 pb-20 bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 min-h-screen">
      {/* Header skeleton */}
      <div className="text-center mb-8">
        <Skeleton className="w-16 h-16 rounded-2xl mx-auto mb-4" />
        <Skeleton className="h-8 w-64 mx-auto mb-2" />
        <Skeleton className="h-5 w-48 mx-auto" />
      </div>

      {/* Monthly Competition skeleton */}
      <div className="mb-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-32" />
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <Skeleton className="h-16" />
              <Skeleton className="h-16" />
            </div>
            <Skeleton className="h-32" />
          </CardContent>
        </Card>
      </div>

      {/* Stats cards skeleton */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <Skeleton className="h-20" />
        <Skeleton className="h-20" />
        <Skeleton className="h-20" />
      </div>

      {/* Progress card skeleton */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-6 w-20" />
          </div>
          <Skeleton className="h-2 w-full mb-2" />
          <Skeleton className="h-4 w-48" />
        </CardContent>
      </Card>

      {/* Invite code card skeleton */}
      <Card className="mb-6">
        <CardHeader>
          <Skeleton className="h-6 w-32 mx-auto" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-16 w-full mb-4" />
          <Skeleton className="h-10 w-32 mx-auto" />
        </CardContent>
      </Card>

      {/* How it works card skeleton */}
      <Card className="mb-6">
        <CardHeader>
          <Skeleton className="h-6 w-28" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Skeleton className="w-8 h-8 rounded-full" />
              <Skeleton className="h-4 w-40" />
            </div>
            <div className="flex items-center gap-4">
              <Skeleton className="w-8 h-8 rounded-full" />
              <Skeleton className="h-4 w-48" />
            </div>
            <div className="flex items-center gap-4">
              <Skeleton className="w-8 h-8 rounded-full" />
              <Skeleton className="h-4 w-36" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Friends list card skeleton */}
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Skeleton className="w-16 h-16 rounded-full mx-auto mb-4" />
            <Skeleton className="h-5 w-32 mx-auto mb-1" />
            <Skeleton className="h-4 w-48 mx-auto" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
