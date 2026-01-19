import Link from "next/link";
import MagicButton from "@/components/MagicButton";
import "./home.css";

export default function Home() {
  return (
    <main className="main-container">
      <section className="hero">
        <h1 className="title magic-text floating">Mental Model Realm</h1>
        <p className="subtitle">Unlock your mind with ancient wisdom in a digital fairy world.</p>
      </section>

      <section className="models-grid">
        <div className="model-card glass-panel floating" style={{ animationDelay: '1s' }}>
          <div className="card-content">
            <h2 className="model-title">Eisenhower Matrix</h2>
            <p className="model-desc">Prioritize tasks by urgency and importance.</p>
            <Link href="/eisenhower-matrix">
              <MagicButton>Enter Matrix</MagicButton>
            </Link>
          </div>
        </div>

        {/* Placeholder for future models */}
        <div className="model-card glass-panel floating" style={{ animationDelay: '2s', opacity: 0.5 }}>
          <div className="card-content">
            <h2 className="model-title">Soon...</h2>
            <p className="model-desc">More ancient scrolls represent models to come.</p>
          </div>
        </div>
      </section>
    </main>
  );
}
