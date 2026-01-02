/**
 * Injects Schema.org JSON-LD structured data for the site.
 *
 * @module
 */

import { type ReactElement } from "react";

/** Base site URL used to build absolute @id and URL values in the JSON-LD. */
const BASE = "https://timounger.github.io";

/** Schema.org LocalBusiness description of the rental service. */
const localBusiness = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "@id": `${BASE}/#business`,
  name: "BonPrinter Box",
  alternateName: "Wertmarkendrucker-Vermietung Timo Unger",
  description:
    "Mietservice für Wertmarkendrucker (BonPrinter Box) für Vereinsfeste, Festivals und Events in Esslingen und Umgebung. Mit individuellem Bondesign, Rückgeldrechner, Pfandsystem und optionalem SumUp-Kartenterminal.",
  url: BASE,
  telephone: "+49-171-8431465",
  email: "bonprinter@gmx.de",
  image: `${BASE}/img/bonprinterbox_front.webp`,
  priceRange: "€€",
  address: {
    "@type": "PostalAddress",
    streetAddress: "Nordring 16",
    postalCode: "73269",
    addressLocality: "Hochdorf",
    addressRegion: "Baden-Württemberg",
    addressCountry: "DE",
  },
  areaServed: [
    { "@type": "City", name: "Esslingen am Neckar" },
    { "@type": "AdministrativeArea", name: "Landkreis Esslingen" },
    { "@type": "AdministrativeArea", name: "Baden-Württemberg" },
  ],
  makesOffer: {
    "@type": "Offer",
    name: "Wertmarkendrucker-Vermietung",
    priceCurrency: "EUR",
    price: "50",
    priceSpecification: {
      "@type": "UnitPriceSpecification",
      price: "50",
      priceCurrency: "EUR",
      referenceQuantity: { "@type": "QuantitativeValue", value: "1", unitCode: "DAY" },
    },
  },
};

/** Schema.org Service description of the printer rental offering. */
const service = {
  "@context": "https://schema.org",
  "@type": "Service",
  "@id": `${BASE}/#service`,
  serviceType: "Wertmarkendrucker-Vermietung",
  name: "BonPrinter Box - Wertmarkendrucker mieten",
  description:
    "Vermietung von Wertmarkendruckern mit Touchscreen-Kasse, individuellem Bondesign, Rückgeldrechner, Pfandsystem und optionaler SumUp-Kartenzahlung. Inklusive Konfiguration und Lieferung im Umkreis von ca. 20 km.",
  provider: { "@id": `${BASE}/#business` },
  areaServed: { "@type": "AdministrativeArea", name: "Baden-Württemberg" },
  offers: {
    "@type": "Offer",
    price: "50",
    priceCurrency: "EUR",
    availability: "https://schema.org/InStock",
    url: `${BASE}/#pricing`,
  },
};

/** Schema.org BreadcrumbList for the site navigation hierarchy. */
const breadcrumb = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [{ "@type": "ListItem", position: 1, name: "Start", item: `${BASE}/` }],
};

/**
 * Injects the Schema.org JSON-LD structured data (LocalBusiness, Service and
 * BreadcrumbList) into the document for SEO.
 */
export default function JsonLd(): ReactElement {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusiness) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(service) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
    </>
  );
}
