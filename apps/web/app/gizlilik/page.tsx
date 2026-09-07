import { Page } from "@/components/Page";
import { getLocale } from "@/lib/i18n";

export const revalidate = 86400;

export default async function PrivacyPage() {
  const tr = (await getLocale()) === "tr";

  const trBody = [
    ["Toplanan veriler", "PlanetAI9, bültene abone olurken verdiğiniz e-posta adresini ve AI Marketplace'e uygulama önerirken paylaştığınız iletişim bilgilerini saklar. Site kullanımına dair anonim istatistikler tutulabilir."],
    ["Kullanım", "E-posta adresiniz yalnızca bülten göndermek için kullanılır ve üçüncü taraflarla paylaşılmaz. Marketplace başvurularındaki e-posta yalnızca gerektiğinde sizinle iletişim için kullanılır ve sitede yayınlanmaz."],
    ["Çerezler", "Dil tercihi (TR/EN) ve tema seçimi tarayıcınızda çerez/localStorage olarak saklanır. Bu tercihler sunucuya kişisel veri olarak gönderilmez."],
    ["Kaynak içerik", "Haber başlıkları ve kısa özetleri orijinal yayıncılardan alınır; tam metin saklanmaz ve her haber orijinal kaynağa bağlanır."],
    ["İletişim", "Verilerinizin silinmesini istemek için Biz Kimiz sayfasındaki iletişim kanallarından bize ulaşabilirsiniz."],
  ];
  const enBody = [
    ["Data we collect", "PlanetAI9 stores the email address you provide when subscribing to the newsletter and the contact details you share when submitting an app to the AI Marketplace. Anonymous usage statistics may be kept."],
    ["How we use it", "Your email is used only to send the newsletter and is never shared with third parties. Emails on Marketplace submissions are used only to contact you if needed and are not published."],
    ["Cookies", "Your language (TR/EN) and theme preference are stored in your browser via cookie/localStorage. These are not sent to the server as personal data."],
    ["Source content", "Headlines and short summaries come from the original publishers; full text is not stored and every story links back to its source."],
    ["Contact", "To request deletion of your data, reach us via the channels on the About page."],
  ];
  const body = tr ? trBody : enBody;

  return (
    <Page title={tr ? "Gizlilik Politikası" : "Privacy Policy"} wide={false}>
      <div className="space-y-8">
        {body.map(([h, p]) => (
          <section key={h}>
            <h2 className="text-[17px] font-bold tracking-tight2 text-ink dark:text-d-ink">{h}</h2>
            <p className="mt-2 text-[15px] leading-relaxed text-ink-2 dark:text-d-ink-2">{p}</p>
          </section>
        ))}
        <p className="text-[12px] text-muted">
          {tr ? "Son güncelleme" : "Last updated"}: {new Date().toLocaleDateString(tr ? "tr-TR" : "en-US", { month: "long", year: "numeric" })}
        </p>
      </div>
    </Page>
  );
}
