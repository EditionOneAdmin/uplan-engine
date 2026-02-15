import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function Datenschutz() {
  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      <div className="pt-32 pb-20 px-6 max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-primary mb-8">Datenschutzerklärung</h1>
        <div className="prose prose-slate space-y-6">
          <p>
            Der Schutz Ihrer personenbezogenen Daten ist uns wichtig.
            Diese Datenschutzerklärung informiert Sie über die Art, den Umfang
            und Zweck der Verarbeitung personenbezogener Daten auf dieser Website.
          </p>
          <h2 className="text-xl font-semibold text-primary">Verantwortlicher</h2>
          <p>U-Plan Engine · hello@uplan-engine.de</p>
          <h2 className="text-xl font-semibold text-primary">Hosting</h2>
          <p>Diese Website wird bei GitHub Pages gehostet. Details zur Datenverarbeitung durch GitHub finden Sie in der GitHub Privacy Policy.</p>
          <h2 className="text-xl font-semibold text-primary">Cookies</h2>
          <p>Diese Website verwendet keine Cookies und keine Tracking-Tools.</p>
        </div>
      </div>
      <Footer />
    </main>
  );
}
