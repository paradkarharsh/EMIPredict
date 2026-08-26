import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-border-hairline bg-surface/50 mt-24 py-12 text-text-tertiary text-[13px]">
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-full overflow-hidden border border-border-hairline bg-black shrink-0">
            <img
              src="/images/logo.jpg"
              alt="EMIPredict AI Logo"
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <span className="font-medium text-text-secondary">EMIPredict AI</span>{" "}
            • Production Intelligent Risk Assessment Platform
          </div>
        </div>
        <div className="flex items-center gap-6">
          <Link href="/" className="hover:text-text-primary transition-colors">
            Overview
          </Link>
          <Link href="/predict" className="hover:text-text-primary transition-colors">
            Predict
          </Link>
          <Link href="/models" className="hover:text-text-primary transition-colors">
            Benchmarks
          </Link>
          <Link href="/explorer" className="hover:text-text-primary transition-colors">
            Explorer
          </Link>
        </div>
        <div>Engineered with Next.js, FastAPI & XGBoost</div>
      </div>
    </footer>
  );
}
