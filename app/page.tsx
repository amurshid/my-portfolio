import ParticleHero from './components/ParticleHero';

export default function Home() {
  return (
    <main className="bg-black text-white">
      {/* Hero: particle portrait → project morph */}
      <ParticleHero />

      {/* Projects section (placeholder) */}
      <section className="max-w-4xl mx-auto px-8 py-24">
        <h2 className="text-3xl font-semibold mb-12 text-white/90">Projects</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {[
            { title: 'Project One', desc: 'Description of what this project does.' },
            { title: 'Project Two', desc: 'Description of what this project does.' },
            { title: 'Project Three', desc: 'Description of what this project does.' },
            { title: 'Project Four', desc: 'Description of what this project does.' },
          ].map(({ title, desc }) => (
            <div
              key={title}
              className="rounded-xl border border-white/10 bg-white/5 p-6 hover:border-indigo-500/50 hover:bg-indigo-950/20 transition-colors"
            >
              <h3 className="text-lg font-medium text-white mb-2">{title}</h3>
              <p className="text-white/50 text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* About / Contact */}
      <section className="max-w-4xl mx-auto px-8 py-16 border-t border-white/10">
        <h2 className="text-3xl font-semibold mb-6 text-white/90">About</h2>
        <p className="text-white/50 leading-relaxed max-w-2xl">
          Add your bio here. Talk about what you build, what you care about, and how to reach you.
        </p>
      </section>
    </main>
  );
}
