import { Header } from "@/components/layout/Header";
import { RepoFeed } from "@/components/feed/RepoFeed";

export default function Home() {
  return (
    <main>
      <Header />
      {/* pt-16 offsets the fixed header height */}
      <div className="pt-16">
        <RepoFeed />
      </div>
    </main>
  );
}
