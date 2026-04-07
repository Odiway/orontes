import Link from "next/link";
import { GAMES } from "@/lib/games";
import {
  Gamepad2,
  MessageCircle,
  Calendar,
  BarChart3,
  Bell,
  Smartphone,
  Zap,
  Shield,
  Trophy,
  ChevronRight,
  Swords,
} from "lucide-react";

export default function HomePage() {
  const featuredGames = GAMES.slice(0, 8);

  return (
    <div className="min-h-screen overflow-hidden">
      {/* Animated background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[128px]" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-[128px]" />
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-neon-purple/5 rounded-full blur-[128px]" />
      </div>

      {/* Navbar */}
      <nav className="relative z-10 max-w-7xl mx-auto px-4 py-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center animate-pulse-glow">
            <Gamepad2 className="w-5 h-5 text-primary" />
          </div>
          <span className="text-xl font-bold gradient-text">Orontes</span>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="text-sm text-muted hover:text-foreground transition px-4 py-2"
          >
            Giriş Yap
          </Link>
          <Link
            href="/register"
            className="text-sm bg-primary hover:bg-primary-hover text-white font-medium rounded-xl px-5 py-2.5 transition"
          >
            Kayıt Ol
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative max-w-7xl mx-auto px-4 pt-16 pb-24 text-center">
        <div className="animate-slide-up">
          <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-1.5 mb-8 text-sm text-primary">
            <Zap className="w-4 h-4" />
            <span>Oyun arkadaşların için ultimate platform</span>
          </div>

          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black mb-6 leading-tight">
            <span className="gradient-text">Birlikte</span>
            <br />
            <span className="text-foreground">Oynayalım.</span>
          </h1>

          <p className="text-lg md:text-xl text-muted max-w-2xl mx-auto mb-10 leading-relaxed">
            CS2, LoL, Valorant, WoW, Metin2... Tüm oyunlarınızı tek yerden
            planlayın. Sohbet edin, oylama yapın, ekip kurun.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/register"
              className="group bg-primary hover:bg-primary-hover text-white font-semibold rounded-2xl px-8 py-4 transition text-lg flex items-center justify-center gap-2"
            >
              <Swords className="w-5 h-5" />
              Maceraya Başla
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/login"
              className="glass border border-border hover:border-primary/50 text-foreground font-medium rounded-2xl px-8 py-4 transition text-lg"
            >
              Zaten Üyeyim
            </Link>
          </div>
        </div>

        {/* Floating game emojis */}
        <div className="hidden md:block">
          <div className="absolute top-20 left-10 text-4xl animate-float" style={{ animationDelay: "0s" }}>🔫</div>
          <div className="absolute top-40 right-16 text-4xl animate-float" style={{ animationDelay: "0.5s" }}>⚔️</div>
          <div className="absolute bottom-20 left-20 text-4xl animate-float" style={{ animationDelay: "1s" }}>🎯</div>
          <div className="absolute bottom-40 right-10 text-4xl animate-float" style={{ animationDelay: "1.5s" }}>🐉</div>
          <div className="absolute top-60 left-1/4 text-3xl animate-float" style={{ animationDelay: "0.7s" }}>⚽</div>
          <div className="absolute bottom-32 right-1/4 text-3xl animate-float" style={{ animationDelay: "1.2s" }}>🗡️</div>
        </div>
      </section>

      {/* Games Showcase */}
      <section className="relative max-w-7xl mx-auto px-4 pb-24">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Tüm <span className="gradient-text">Favori Oyunların</span> Tek Yerde
          </h2>
          <p className="text-muted max-w-xl mx-auto">
            FPS, MOBA, MMORPG, Battle Royale... Her türden oyun için ekip kur
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 stagger-children">
          {featuredGames.map((game) => (
            <div
              key={game.id}
              className={`game-card relative overflow-hidden rounded-2xl border ${game.border} ${game.bg} p-5 cursor-default`}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${game.gradient} opacity-5`} />
              <div className="relative">
                <span className="text-3xl mb-3 block">{game.emoji}</span>
                <h3 className={`font-bold text-sm ${game.text}`}>{game.shortName}</h3>
                <p className="text-xs text-muted mt-1">{game.category}</p>
                <p className="text-xs text-muted/70 mt-2 leading-relaxed">{game.description}</p>
              </div>
            </div>
          ))}
        </div>

        <p className="text-center text-sm text-muted mt-6">
          + {GAMES.length - 8} oyun daha...
        </p>
      </section>

      {/* Features Grid */}
      <section className="relative max-w-7xl mx-auto px-4 pb-24">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Neden <span className="gradient-text">Orontes</span>?
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6 stagger-children">
          <FeatureCard
            icon={<MessageCircle className="w-6 h-6" />}
            title="Anlık Sohbet"
            desc="Gerçek zamanlı grup sohbeti. Oyun stratejilerini konuşun, planlar yapın."
            color="text-accent"
          />
          <FeatureCard
            icon={<Calendar className="w-6 h-6" />}
            title="Oyun Planları"
            desc="CS2 maçı mı? LoL ranked mı? Zaman ve oyun seçip ekibi topla."
            color="text-success"
          />
          <FeatureCard
            icon={<BarChart3 className="w-6 h-6" />}
            title="Oylamalar"
            desc="Bu akşam ne oynayalım? Demokratik oylama ile karar verin."
            color="text-warning"
          />
          <FeatureCard
            icon={<Bell className="w-6 h-6" />}
            title="Canlı Bildirimler"
            desc="Yeni davet, mesaj veya oylama olduğunda anında bilgilendirilin."
            color="text-danger"
          />
          <FeatureCard
            icon={<Shield className="w-6 h-6" />}
            title="Güvenli & Hızlı"
            desc="Şifreli oturum, hızlı sunucular. Verileriniz güvende."
            color="text-primary"
          />
          <FeatureCard
            icon={<Smartphone className="w-6 h-6" />}
            title="Mobil Uygulama"
            desc="iOS ve Android'de ücretsiz PWA. App Store gerekmez!"
            color="text-neon-purple"
          />
        </div>
      </section>

      {/* Stats */}
      <section className="relative max-w-5xl mx-auto px-4 pb-24">
        <div className="glass rounded-3xl border border-border p-8 md:p-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <StatItem emoji="🎮" value={`${GAMES.length}+`} label="Desteklenen Oyun" />
            <StatItem emoji="⚡" value="Anlık" label="Gerçek Zamanlı" />
            <StatItem emoji="📱" value="PWA" label="Mobil Uygulama" />
            <StatItem emoji="🔒" value="Güvenli" label="JWT Şifreleme" />
          </div>
        </div>
      </section>

      {/* PWA Install */}
      <section className="relative max-w-4xl mx-auto px-4 pb-24">
        <div className="glass rounded-3xl border border-border p-8 md:p-12">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-accent/10 mb-4">
              <Smartphone className="w-8 h-8 text-accent" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold mb-3">
              Telefonuna Yükle <span className="text-accent">(Ücretsiz!)</span>
            </h2>
            <p className="text-muted">App Store veya Play Store gerekmez</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-surface/50 rounded-2xl p-6 border border-border">
              <h3 className="font-bold mb-3 flex items-center gap-2">
                <span className="text-xl">🍎</span> iPhone / iPad
              </h3>
              <ol className="text-sm text-muted space-y-2 list-decimal pl-4">
                <li>Safari&apos;de siteyi aç</li>
                <li>Paylaş butonuna bas (⬆️)</li>
                <li>&quot;Ana Ekrana Ekle&quot; seç</li>
                <li>&quot;Ekle&quot;ye bas, hazırsın!</li>
              </ol>
            </div>
            <div className="bg-surface/50 rounded-2xl p-6 border border-border">
              <h3 className="font-bold mb-3 flex items-center gap-2">
                <span className="text-xl">🤖</span> Android
              </h3>
              <ol className="text-sm text-muted space-y-2 list-decimal pl-4">
                <li>Chrome&apos;da siteyi aç</li>
                <li>Üç nokta menüyü aç (⋮)</li>
                <li>&quot;Uygulamayı yükle&quot; seç</li>
                <li>&quot;Yükle&quot;ye bas, hazırsın!</li>
              </ol>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative max-w-4xl mx-auto px-4 pb-24 text-center">
        <div className="mb-6 flex items-center justify-center gap-2 text-4xl">
          <Trophy className="w-10 h-10 text-gold" />
        </div>
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          Ekibini Topla, <span className="gradient-text">Sahaya İn</span>
        </h2>
        <p className="text-muted mb-8 max-w-xl mx-auto">
          Arkadaşlarınla birlikte oynamak hiç bu kadar kolay olmamıştı
        </p>
        <Link
          href="/register"
          className="inline-flex items-center gap-2 bg-primary hover:bg-primary-hover text-white font-semibold rounded-2xl px-10 py-4 transition text-lg"
        >
          <Gamepad2 className="w-5 h-5" />
          Hemen Başla
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 text-center text-sm text-muted">
        <p className="flex items-center justify-center gap-2">
          <Gamepad2 className="w-4 h-4" />
          Orontes — Gaming Squad Hub
        </p>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  desc,
  color,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
  color: string;
}) {
  return (
    <div className="game-card glass rounded-2xl border border-border p-6">
      <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-surface mb-4 ${color}`}>
        {icon}
      </div>
      <h3 className="text-lg font-bold mb-2">{title}</h3>
      <p className="text-sm text-muted leading-relaxed">{desc}</p>
    </div>
  );
}

function StatItem({
  emoji,
  value,
  label,
}: {
  emoji: string;
  value: string;
  label: string;
}) {
  return (
    <div>
      <span className="text-2xl mb-2 block">{emoji}</span>
      <div className="text-2xl font-bold gradient-text">{value}</div>
      <div className="text-sm text-muted mt-1">{label}</div>
    </div>
  );
}
