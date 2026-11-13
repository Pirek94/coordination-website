import { Resend } from "resend";
import { siteUrl } from "@/lib/site";

/**
 * E-mails about FAQ questions. Both are a courtesy: every question is in the
 * panel whether or not an e-mail goes out, so a missing Resend setup or a
 * failed send is logged and reported, never thrown.
 */

function client() {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;

  return apiKey && from ? { resend: new Resend(apiKey), from } : null;
}

/** Tells us a visitor asked something; true when the e-mail went out. */
export async function notifyNewQuestion(question: { name: string; email: string; submitted: string }) {
  const mail = client();
  const to = process.env.CONTACT_EMAIL;

  if (!mail || !to) {
    console.error("Formularz FAQ: brak RESEND_API_KEY, RESEND_FROM_EMAIL lub CONTACT_EMAIL, pytanie czeka w panelu");

    return false;
  }

  const header = [
    `Imię: ${question.name || "(anonimowo)"}`,
    question.email ? `E-mail: ${question.email}` : "E-mail: (nie podano)",
  ];

  try {
    // The asker's address is the reply-to, so answering the notification
    // answers the person: `from` has to stay on our own verified domain.
    const { error } = await mail.resend.emails.send({
      from: mail.from,
      to,
      replyTo: question.email || undefined,
      subject: `FAQ: nowe pytanie${question.name ? ` od ${question.name}` : " (anonimowe)"}`,
      text: `${header.join("\n")}\n\n${question.submitted}\n\nOdpowiedz w panelu: ${siteUrl}/admin/faq\n`,
    });

    if (error) throw error;

    return true;
  } catch (error) {
    console.error("Formularz FAQ: Resend odrzucił wysyłkę, pytanie czeka w panelu", error);

    return false;
  }
}

/** Tells the asker their answer is out; true when the e-mail went out. */
export async function notifyAsker(question: { id: number; name: string; email: string }) {
  const mail = client();

  if (!mail) {
    console.error("FAQ: brak RESEND_API_KEY lub RESEND_FROM_EMAIL, autor pytania nie dostał powiadomienia");

    return false;
  }

  const greeting = question.name ? `Dzień dobry, ${question.name}!` : "Dzień dobry!";

  try {
    const { error } = await mail.resend.emails.send({
      from: mail.from,
      to: question.email,
      replyTo: process.env.CONTACT_EMAIL || undefined,
      subject: "Odpowiedzieliśmy na Twoje pytanie",
      text: [
        greeting,
        "",
        "Dziękujemy za pytanie zadane przez formularz na stronie Coordination. Odpowiedź jest już opublikowana:",
        `${siteUrl}/faq#pytanie-${question.id}`,
        "",
        "Pytanie publikujemy anonimowo: bez imienia i adresu e-mail.",
        "Jeśli chcesz porozmawiać o swojej sytuacji bezpośrednio, po prostu odpowiedz na tę wiadomość.",
        "",
        "Zespół Coordination",
        "",
      ].join("\n"),
    });

    if (error) throw error;

    return true;
  } catch (error) {
    console.error("FAQ: Resend odrzucił powiadomienie autora pytania", error);

    return false;
  }
}
