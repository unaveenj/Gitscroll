import { Header } from "@/components/layout/Header";
import { RepoFeed } from "@/components/feed/RepoFeed";

export default function Home() {
  return (
    <main>
      <Header />
      <div style={{ paddingTop: "var(--header-height)" }}>
        <RepoFeed />
      </div>
    </main>
  );
}
