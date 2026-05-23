"use client";
import Link from "next/link";
import { useCatalog } from "@/application/hooks/useCatalog";

export function ProductSidebar({ currentCategory }: { currentCategory?: string }) {
  const { categories } = useCatalog();
  
  const tree = categories?.filter(c => !c.parentId).map(c => ({
    ...c,
    children: categories.filter(child => child.parentId === c.id)
  }));

  return (
    <aside className="w-full md:w-64 shrink-0">
      <div className="bg-white border rounded-xl p-5 sticky top-24">
        <h3 className="font-bold text-lg mb-4 pb-2 border-b uppercase">Danh mục</h3>
        <ul className="space-y-1">
          <li>
            <Link 
              href="/products" 
              className={`block py-2 text-sm hover:text-primary transition-colors ${!currentCategory ? 'text-primary font-bold' : 'text-neutral-600'}`}
            >
              Tất cả sản phẩm
            </Link>
          </li>
          {tree?.map((category) => (
            <li key={category.id}>
              <Link 
                href={`/products?category=${category.slug || category.id}`}
                className={`block py-2 text-sm hover:text-primary transition-colors ${currentCategory === (category.slug || category.id) ? 'text-primary font-bold' : 'text-neutral-600'}`}
              >
                {category.name}
              </Link>
              {category.children.length > 0 && (
                <ul className="pl-4 mt-1 space-y-1 border-l-2 border-neutral-100 ml-2">
                  {category.children.map(child => (
                    <li key={child.id}>
                      <Link 
                        href={`/products?category=${child.slug || child.id}`}
                        className={`block py-1.5 text-sm hover:text-primary transition-colors ${currentCategory === (child.slug || child.id) ? 'text-primary font-medium' : 'text-neutral-500'}`}
                      >
                        {child.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}
