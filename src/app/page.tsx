import { Header } from "@/components/layout/Header";
import { RepoFeed } from "@/components/feed/RepoFeed";

export default function Home() {
  return (
    <main>
      <Header />
      <RepoFeed />
    </main>
  );
}
