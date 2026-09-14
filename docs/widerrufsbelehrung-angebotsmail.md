# Textbaustein Widerrufsbelehrung für Angebots- und Bestätigungsmails

Die Seite `/widerruf` allein erfüllt die Belehrungspflicht **nicht**. Nach
§ 312d BGB i. V. m. Art. 246a EGBGB muss die Widerrufsbelehrung dem Verbraucher
**vor Vertragsschluss** und zusätzlich nach Vertragsschluss auf einem
**dauerhaften Datenträger** zur Verfügung gestellt werden - eine E-Mail reicht
dafür aus, ein bloßer Link auf die Webseite nicht.

## Wann einfügen

| Kunde                                              | Belehrung nötig? |
| -------------------------------------------------- | ---------------- |
| Privatperson (Verbraucher, § 13 BGB)               | **ja**           |
| Verein ohne gewerbliche Tätigkeit                  | im Zweifel ja    |
| Firma, Gewerbe, Kommune (Unternehmer, § 14 BGB)    | nein             |

Im Zweifel immer mitschicken - es schadet nicht, das Weglassen dagegen schon
(Widerrufsfrist verlängert sich dann auf 12 Monate + 14 Tage, § 356 Abs. 3 BGB).

## Baustein 1: Angebotsmail (vor Vertragsschluss)

> **Hinweis zum Widerrufsrecht**
>
> Als Verbraucher haben Sie das Recht, binnen vierzehn Tagen ohne Angabe von
> Gründen diesen Vertrag zu widerrufen. Die Widerrufsfrist beträgt vierzehn Tage
> ab dem Tag des Vertragsabschlusses. Die vollständige Widerrufsbelehrung samt
> Muster-Widerrufsformular finden Sie unten in dieser E-Mail sowie unter
> https://timounger.github.io/widerruf/

## Baustein 2: Auftragsbestätigung (vollständige Belehrung, immer anhängen)

> **Widerrufsbelehrung**
>
> **Widerrufsrecht**
>
> Sie haben das Recht, binnen vierzehn Tagen ohne Angabe von Gründen diesen
> Vertrag zu widerrufen. Die Widerrufsfrist beträgt vierzehn Tage ab dem Tag des
> Vertragsabschlusses.
>
> Um Ihr Widerrufsrecht auszuüben, müssen Sie mir (Timo Unger - Software
> Engineering, Nordring 16, 73269 Hochdorf, E-Mail: bonprinter@gmx.de, Telefon:
> +49 171 8431465) mittels einer eindeutigen Erklärung (z. B. ein mit der Post
> versandter Brief oder eine E-Mail) über Ihren Entschluss, diesen Vertrag zu
> widerrufen, informieren. Sie können dafür das beigefügte
> Muster-Widerrufsformular verwenden, das jedoch nicht vorgeschrieben ist.
>
> Zur Wahrung der Widerrufsfrist reicht es aus, dass Sie die Mitteilung über die
> Ausübung des Widerrufsrechts vor Ablauf der Widerrufsfrist absenden.
>
> **Folgen des Widerrufs**
>
> Wenn Sie diesen Vertrag widerrufen, habe ich Ihnen alle Zahlungen, die ich von
> Ihnen erhalten habe, einschließlich der Lieferkosten (mit Ausnahme der
> zusätzlichen Kosten, die sich daraus ergeben, dass Sie eine andere Art der
> Lieferung als die von mir angebotene, günstigste Standardlieferung gewählt
> haben), unverzüglich und spätestens binnen vierzehn Tagen ab dem Tag
> zurückzuzahlen, an dem die Mitteilung über Ihren Widerruf dieses Vertrags bei
> mir eingegangen ist. Für diese Rückzahlung verwende ich dasselbe Zahlungsmittel,
> das Sie bei der ursprünglichen Transaktion eingesetzt haben, es sei denn, mit
> Ihnen wurde ausdrücklich etwas anderes vereinbart; in keinem Fall werden Ihnen
> wegen dieser Rückzahlung Entgelte berechnet.
>
> Haben Sie verlangt, dass die Dienstleistungen während der Widerrufsfrist
> beginnen sollen, so haben Sie mir einen angemessenen Betrag zu zahlen, der dem
> Anteil der bis zu dem Zeitpunkt, zu dem Sie mich von der Ausübung des
> Widerrufsrechts hinsichtlich dieses Vertrags unterrichten, bereits erbrachten
> Dienstleistungen im Vergleich zum Gesamtumfang der im Vertrag vorgesehenen
> Dienstleistungen entspricht.
>
> **Muster-Widerrufsformular**
>
> (Wenn Sie den Vertrag widerrufen wollen, füllen Sie bitte dieses Formular aus
> und senden Sie es zurück.)
>
> An Timo Unger - Software Engineering, Nordring 16, 73269 Hochdorf, E-Mail:
> bonprinter@gmx.de
>
> Hiermit widerrufe(n) ich/wir (\*) den von mir/uns (\*) abgeschlossenen Vertrag
> über die Erbringung der folgenden Dienstleistung (\*)
>
> Bestellt am (\*) / erhalten am (\*)
>
> Name des/der Verbraucher(s)
>
> Anschrift des/der Verbraucher(s)
>
> Unterschrift des/der Verbraucher(s) (nur bei Mitteilung auf Papier)
>
> Datum
>
> (\*) Unzutreffendes streichen.

## Baustein 3: Vorzeitiger Leistungsbeginn

Nur nötig, wenn der Einsatztag **innerhalb der 14-Tage-Frist** liegt - also bei
kurzfristigen Buchungen. Ohne diese ausdrückliche Zustimmung bekommst du bei
einem Widerruf **keinen Wertersatz**, obwohl du schon geliefert hast.

Lass dir das per Antwortmail bestätigen (eine formlose Zustimmung im Text reicht):

> **Zustimmung zum vorzeitigen Leistungsbeginn**
>
> Bitte bestätigen Sie mir kurz per Antwort auf diese E-Mail:
>
> "Ich verlange ausdrücklich, dass Sie mit der Leistung vor Ablauf der
> Widerrufsfrist beginnen. Mir ist bekannt, dass mein Widerrufsrecht mit der
> vollständigen Erbringung der Leistung erlischt."

## Pflege

Ändern sich Adresse, E-Mail oder Telefonnummer, müssen sie **an beiden Stellen**
angepasst werden: hier und in
[website/app/widerruf/page.tsx](../website/app/widerruf/page.tsx).
