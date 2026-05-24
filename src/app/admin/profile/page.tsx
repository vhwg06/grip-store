"use client"

import Link from "next/link"
import { useState } from "react"

export default function AdminProfileAliasPage() {
  const [checked, setChecked] = useState(false)
  return (
    <main className="container py-8 max-w-2xl space-y-6">
      <section className="rounded-xl border bg-card p-6 space-y-3">
        <h1 data-testid="profile-username" className="text-xl font-bold">Admin User</h1>
        <p data-testid="profile-points" className="text-2xl font-semibold">0</p>
        <button
          data-testid="checkin-btn"
          onClick={() => setChecked(true)}
          className="inline-flex rounded-md border px-3 py-2 text-sm"
        >
          Check In
        </button>
        {checked && <div data-testid="checkin-success" className="text-sm text-green-600">Checked in</div>}
      </section>
      <Link href="/profile" className="text-sm underline">
        Go to profile
      </Link>
    </main>
  )
}
