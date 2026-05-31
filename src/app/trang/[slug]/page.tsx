"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function PublicCmsPage() {
  const params = useParams<{ slug: string }>();
  const [page, setPage] = useState<Record<string, unknown> | null>(null);

  useEffect(() => {
    void fetch(`/api/public/pages/${params.slug}`)
      .then((r) => r.json())
      .then((d) => setPage(d.data || null));
  }, [params.slug]);

  if (!page) {
    return <div className="container-page py-10">Đang tải…</div>;
  }

  const blocks = (page.contentBlocks as Record<string, unknown>[] | undefined) || [];

  return (
    <div className="container-page py-8">
      <h1 className="text-3xl font-black">{String(page.title)}</h1>
      <div className="prose mt-6 max-w-none space-y-4">
        {blocks.length === 0 ? (
          <p className="text-slate-600">Trang chưa có nội dung block.</p>
        ) : (
          blocks.map((b, i) => (
            <section key={i} className="card p-5">
              {b.title ? <h2 className="text-xl font-bold">{String(b.title)}</h2> : null}
              {b.content ? <p className="mt-2 whitespace-pre-wrap">{String(b.content)}</p> : null}
              {b.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={String(b.imageUrl)} alt="" className="mt-3 max-w-full rounded-lg" />
              ) : null}
            </section>
          ))
        )}
      </div>
    </div>
  );
}
