"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function NewArticleRedirect() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const urlParams = new URLSearchParams();
    urlParams.set("compose", "new");

    searchParams.forEach((value, key) => {
      urlParams.set(key, value);
    });

    router.replace(`/admin/articles?${urlParams.toString()}`);
  }, [router, searchParams]);

  return null;
}

export default function NewArticlePage() {
  return (
    <Suspense fallback={null}>
      <NewArticleRedirect />
    </Suspense>
  );
}

