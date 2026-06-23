const PARTNERS = [
  { name: "UNICEF India",         abbr: "UNICEF"  },
  { name: "Govt. of Uttar Pradesh", abbr: "UP Govt" },
  { name: "Rotary Club Noida",    abbr: "Rotary"  },
  { name: "CRY India",            abbr: "CRY"     },
  { name: "HelpAge India",        abbr: "HelpAge" },
  { name: "Akshaya Patra",        abbr: "AkPatra" },
];

export default function PartnerLogos() {
  const doubled = [...PARTNERS, ...PARTNERS];

  return (
    <section className="border-t border-[#1B5E37]/10 bg-white py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <p className="mb-10 text-center text-xs font-semibold uppercase tracking-widest text-[#1A1A1A]/40">
          Partners &amp; Supporters
        </p>

        {/* Infinite marquee */}
        <div className="overflow-hidden">
          <div
            className="animate-marquee flex items-center gap-8"
            style={{ width: "max-content" }}
          >
            {doubled.map((partner, i) => (
              <div
                key={`${partner.abbr}-${i}`}
                className="flex h-16 w-36 shrink-0 flex-col items-center justify-center rounded-xl border border-[#1B5E37]/10 bg-[#F9FBF9] transition-all hover:border-[#1B5E37]/30 hover:bg-white hover:shadow-sm"
                title={partner.name}
              >
                <span className="font-heading text-base font-bold text-[#1B5E37]">
                  {partner.abbr}
                </span>
                <span className="mt-0.5 text-[10px] text-[#1A1A1A]/40">{partner.name}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="mt-8 text-center text-xs text-[#1A1A1A]/35">
          Interested in partnering with us?{" "}
          <a href="/csr" className="text-[#1B5E37] underline-offset-2 hover:underline">
            Explore CSR opportunities →
          </a>
        </p>
      </div>
    </section>
  );
}
