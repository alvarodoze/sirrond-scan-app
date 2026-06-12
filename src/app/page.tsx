import Link from "next/link";

export default function HomePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Sirrond</h1>
        <p className="mt-1 text-sm text-slate-600">
          Work Experience Referral — image to database
        </p>
      </div>

      <Link
        href="/scan"
        className="flex items-center justify-between rounded-2xl bg-blue-600 p-5 text-white shadow-lg shadow-blue-600/20"
      >
        <div>
          <p className="font-semibold">Scan paper form</p>
          <p className="mt-0.5 text-sm text-blue-100">
            Photograph a handwritten form
          </p>
        </div>
        <span className="text-2xl">→</span>
      </Link>

      <Link
        href="/form"
        className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
      >
        <div>
          <p className="font-semibold text-slate-900">Digital form</p>
          <p className="mt-0.5 text-sm text-slate-500">
            Enter data directly — no scan
          </p>
        </div>
        <span className="text-2xl text-slate-400">→</span>
      </Link>

      <Link
        href="/history"
        className="block rounded-2xl border border-slate-200 bg-white p-4 text-center text-sm font-medium text-slate-700"
      >
        View submission history
      </Link>
    </div>
  );
}
