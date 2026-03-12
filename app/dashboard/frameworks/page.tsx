import Link from 'next/link';

export default function FrameworksIndex() {
  return (
    <main className="p-4 space-y-6">
      <h1 className="text-2xl font-bold">Frameworks</h1>
      <p>Select a framework to analyze:</p>
      <ul className="list-disc pl-5">
        <li>
          <Link href="/dashboard/frameworks/mitre-attack" className="text-blue-500 hover:underline">
            MITRE ATT&amp;CK
          </Link>
        </li>
      </ul>
    </main>
  );
}
