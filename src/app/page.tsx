import Link from "next/link";
import {
  Gamepad2,
  MessageCircle,
  Calendar,
  BarChart3,
  Bell,
  Smartphone,
} from "lucide-react";

function FeatureCard({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <div className="bg-surface rounded-2xl border border-border p-6 hover:border-primary/50 transition">
      <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 text-primary mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-sm text-muted">{desc}</p>
    </div>
  );
}

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-accent/10" />
        <div className="relative max-w-5xl mx-auto px-4 py-24 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-primary/20 mb-6 animate-pulse-glow">
            <Gamepad2 className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Orontes
          </h1>
          <p className="text-xl text-muted max-w-2xl mx-auto mb-8">
            Arkadaş grubunuz için oyun merkezi. Sohbet edin, oyun planlayın,
            oylama yapın ve birlikte eğlenin!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/register"
              className="bg-primary hover:bg-primary-hover text-white font-medium rounded-xl px-8 py-3 transition text-lg"
            >
              Gruba Katıl
            </Link>
            <Link
              href="/login"
              className="bg-surface hover:bg-surface-hover border border-border text-foreground font-medium rounded-xl px-8 py-3 transition text-lg"
            >
              Giriş Yap
            </Link>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="max-w-5xl mx-auto px-4 py-16">
        <div className="grid md:grid-cols-3 gap-6">
          <FeatureCard
            icon={<MessageCircle className="w-6 h-6" />}
            title="Grup Sohbeti"
            desc="Arkadaşlarınla anlık mesajlaşma. Ne zaman, hangi oyun, anında konuş."
          />
          <FeatureCard
            icon={<Calendar className="w-6 h-6" />}
            title="Oyun Planları"
            desc="Oyun seansları planla, davet gönder. Kim geliyor, kim gelmiyor hemen gör."
          />
          <FeatureCard
            icon={<BarChart3 className="w-6 h-6" />}
            title="Oylamalar"
            desc="Hangi oyunu oynayalım? Ne zaman buluşalım? Demokratik karar verin."
          />
          <FeatureCard
            icon={<Bell className="w-6 h-6" />}
            title="Canlı Bildirimler"
            desc="Yeni oyun daveti, mesaj veya oylama olduğunda anında haberdar ol."
          />
          <FeatureCard
            icon={<Gamepad2 className="w-6 h-6" />}
            title="Oyun Takibi"
            desc="Planlanmış, aktif ve tamamlanmış oyun seanslarını takip et."
          />
          <FeatureCard
            icon={<Smartphone className="w-6 h-6" />}
            title="Mobil Uygulama"
            desc="iOS ve Android&#39;de ücretsiz PWA olarak yükle. App Store gerektirmez!"
          />
        </div>
      </div>

      {/* PWA Install Guide */}
      <div className="max-w-3xl mx-auto px-4 py-16">
        <div className="bg-surface rounded-2xl border border-border p-8 text-center">
          <Smartphone className="w-10 h-10 text-accent mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-3">
            Telefonuna Yükle (Ücretsiz!)
          </h2>
          <p className="text-muted mb-6">
            App Store veya Play Store gerekmez. Direkt tarayıcından yükle.
          </p>
          <div className="grid md:grid-cols-2 gap-6 text-left">
            <div className="bg-background rounded-xl p-4 border border-border">
              <h3 className="font-semibold mb-2">iPhone / iPad</h3>
              <ol className="text-sm text-muted space-y-1 list-decimal pl-4">
                <li>Safari&#39;de siteyi aç</li>
                <li>Paylaş butonuna bas</li>
                <li>&#34;Ana Ekrana Ekle&#34; seç</li>
                <li>Ekle&#39;ye bas, tamam!</li>
              </ol>
            </div>
            <div className="bg-background rounded-xl p-4 border border-border">
              <h3 className="font-semibold mb-2">Android</h3>
              <ol className="text-sm text-muted space-y-1 list-decimal pl-4">
                <li>Chrome&#39;da siteyi aç</li>
                <li>Üç nokta menüyü aç</li>
                <li>&#34;Uygulamayı yükle&#34; seç</li>
                <li>Yükle&#39;ye bas, tamam!</li>
              </ol>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-border py-8 text-center text-sm text-muted">
        <p>Orontes — Gaming Squad Hub</p>
      </footer>
    </div>
  );
}
