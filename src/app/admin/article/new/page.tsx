import { redirect } from "next/navigation";

export const metadata = {
  title: "Thêm Bài viết | Admin GRIP",
};

export default async function NewArticlePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const resolvedParams = await searchParams;
  const urlParams = new URLSearchParams();
  urlParams.set("compose", "new");

  Object.entries(resolvedParams).forEach(([key, value]) => {
    if (value !== undefined) {
      if (Array.isArray(value)) {
        value.forEach((v) => urlParams.append(key, v));
      } else {
        urlParams.set(key, value);
      }
    }
  });

  redirect(`/admin/articles?${urlParams.toString()}`);
}

