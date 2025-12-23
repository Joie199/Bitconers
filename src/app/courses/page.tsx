import Link from "next/link";

const courseStructure = {
  levels: [
    {
      name: "Level I (Genesis) — Foundations, the fiat problem, and first steps into Bitcoin",
      chapters: [
        { id: "ch01-nature-of-money", title: "Chapter 1: The Nature of Money" },
        { id: "ch02-journey-of-money", title: "Chapter 2: The Journey of Money" },
        { id: "ch03-fiat-problems", title: "Chapter 3: Problems with Traditional (Fiat) Money" },
        { id: "ch04-crisis-to-innovation", title: "Chapter 4: From Crisis to Innovation" },
        { id: "ch05-birth-of-bitcoin", title: "Chapter 5: The Birth of Bitcoin" },
        { id: "ch06-keys-and-transactions", title: "Chapter 6: Keys and Transactions" },
        { id: "ch07-blockchain-basics", title: "Chapter 7: Blockchain Basics" },
        { id: "ch08-exchange-and-wallet", title: "Chapter 8: Exchange & Software Wallet" },
      ],
    },
    {
      name: "Level II (Difficulty-Adjustment 1)",
      chapters: [
        { id: "ch09-utxos-fees", title: "Chapter 9: UTXOs, Fees & Coin Control" },
        { id: "ch10-hygiene", title: "Chapter 10: Good Bitcoin Hygiene" },
        { id: "ch11-hardware-signers", title: "Chapter 11: Hardware Signers" },
        { id: "ch12-layer2-sidechains", title: "Chapter 12: Layer 2 & Sidechains" },
        { id: "ch13-verify", title: "Chapter 13: Verify for Yourself — Block Explorers & Nodes" },
        { id: "ch14-pow-rewards", title: "Chapter 14: Proof of Work and Block Rewards" },
        { id: "ch15-mining-practice", title: "Chapter 15: Mining in Practice" },
      ],
    },
    {
      name: "Level III (Advanced Sovereignty)",
      chapters: [
        { id: "ch16-full-node-lightning", title: "Chapter 16: Full Node & Opening a Lightning Channel" },
        { id: "ch17-multisig", title: "Chapter 17: Multi-Sig (Collaborative Custody)" },
        { id: "ch18-bitcoin-script", title: "Chapter 18: Intro to Bitcoin Script" },
        { id: "ch19-consolidation-privacy", title: "Chapter 19: UTXO Consolidation & Privacy Risks" },
        { id: "ch20-philosophy", title: "Chapter 20: Why Bitcoin? Philosophy & Adoption" },
        { id: "ch21-wrap-up", title: "Chapter 21: Wrap-Up & Resources" },
      ],
    },
  ],
};

export default function CoursesPage() {
  const baseUrl = "https://github.com/Joie199/pan-africa-bitcoin-academy/blob/main/content/courses/genesis/chapters";

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 space-y-8">
      <header className="space-y-3">
        <p className="text-sm uppercase tracking-[0.25em] text-orange-300/80">
          Courses
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-50 sm:text-4xl lg:text-5xl">
          Bitcoin Foundations (Genesis)
        </h1>
        <p className="text-base text-zinc-300">
          Open course materials (CC-BY-SA-4.0) organized in this repository,
          inspired by the lnbook structure.
        </p>
      </header>

      <div className="space-y-8">
        {courseStructure.levels.map((level, levelIndex) => (
          <section key={levelIndex} className="space-y-4">
            <h2 className="text-2xl font-semibold text-zinc-50 border-b border-zinc-800 pb-2">
              {level.name}
            </h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {level.chapters.map((chapter) => (
                <Link
                  key={chapter.id}
                  href={`${baseUrl}/${chapter.id}.md`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block rounded-lg border border-zinc-800 bg-zinc-900/50 p-4 transition hover:border-orange-400/50 hover:bg-zinc-900"
                >
                  <h3 className="text-sm font-medium text-zinc-100 mb-1">
                    {chapter.title}
                  </h3>
                  <p className="text-xs text-zinc-400">
                    View on GitHub →
                  </p>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>

      <section className="space-y-3 pt-8 border-t border-zinc-800">
        <h2 className="text-xl font-semibold text-zinc-50">Repository Structure</h2>
        <ul className="list-disc space-y-2 pl-5 text-zinc-300">
          <li>
            <span className="font-medium text-zinc-100">Content folder:</span>{" "}
            <code className="text-sm text-orange-200">content/courses/genesis</code>
          </li>
          <li>
            <span className="font-medium text-zinc-100">Chapters:</span>{" "}
            <code className="text-sm text-orange-200">content/courses/genesis/chapters</code>
          </li>
          <li>
            <span className="font-medium text-zinc-100">Images:</span>{" "}
            <code className="text-sm text-orange-200">content/courses/genesis/images/</code>{" "}
            (place provided assets with referenced filenames)
          </li>
          <li>
            <span className="font-medium text-zinc-100">License:</span> CC-BY-SA-4.0
          </li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-zinc-50">Quick Links</h2>
        <div className="space-y-2">
          <Link
            href="https://github.com/Joie199/pan-africa-bitcoin-academy/tree/main/content/courses/genesis"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-lg border border-orange-400/40 px-4 py-2 text-sm font-semibold text-orange-200 transition hover:border-orange-400/70 hover:bg-orange-400/10"
          >
            View course folder on GitHub
          </Link>
          <div className="text-sm text-zinc-400">
            All course materials are available in the repository. Click any chapter above to view it on GitHub.
          </div>
        </div>
      </section>
    </div>
  );
}
