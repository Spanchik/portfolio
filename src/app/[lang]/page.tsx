import { notFound } from "next/navigation";
import { Story } from "@/components/sections/story/Story";
import { About } from "@/components/sections/about/About";
import { Contact } from "@/components/sections/contact/Contact";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { hasLocale } from "@/lib/i18n/config";

export default async function Page({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();

  const dict = getDictionary(lang);

  return (
    <main>
      <Story dict={dict} />
      <About dict={dict} lang={lang} />
      <Contact dict={dict} />
    </main>
  );
}
