'use client';

import { ChatContainer } from '@/components/chat/ChatContainer';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { ParticleBackground } from '@/components/glass/ParticleBackground';

export default function Home() {
  return (
    <div className="relative min-h-screen flex flex-col">
      <ParticleBackground />
      <Header />
      <main className="flex-1 relative z-10">
        <ChatContainer />
      </main>
      <Footer />
    </div>
  );
}
