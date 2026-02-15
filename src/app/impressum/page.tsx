import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function Impressum() {
  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      <div className="pt-32 pb-20 px-6 max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-primary mb-8">Impressum</h1>
        <div className="prose prose-slate">
          <p>Angaben gemäß § 5 TMG</p>
          <p className="mt-4">
            U-Plan Engine<br />
            [Adresse wird ergänzt]<br />
            Deutschland
          </p>
          <h2 className="text-xl font-semibold text-primary mt-8 mb-4">Kontakt</h2>
          <p>E-Mail: hello@uplan-engine.de</p>
        </div>
      </div>
      <Footer />
    </main>
  );
}
