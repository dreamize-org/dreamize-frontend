'use client';

import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { ProgramsNav } from '@/components/programs-nav';
import { PlayfulHero } from '@/components/playful-hero';
import { useRouter } from '@/hooks/useRouter';

export default function BuilderPage() {
  const router = useRouter()
  return (
    <>
      <Navbar />

      <PlayfulHero
        pillTracker="Builder to Founder"
        titleLight="Building"
        titleBold="habits &"
        titleHighlight="solutions"
        description="Transitioning from curiosity to consistent building. Students move from 'Can I build this?' to 'Is this worth building?' while delivering real things to real people."
      />

      <ProgramsNav />

      {/* ── STAGES TRACK ── */}
      <section className="py-[100px] px-6 bg-background">
        <div className="max-w-6xl mx-auto space-y-[120px]">

          {/* Builder Stage */}
          <div className="grid lg:grid-cols-[1fr_1.5fr] gap-16 items-center">
            <div>
              <span className="text-sm font-bold text-primary uppercase tracking-widest mb-4 block">Stage 2: The Builder</span>
              <h2 className="text-[32px] md:text-[44px] font-playfair font-semibold text-foreground mb-6 leading-tight">
                Turn curiosity into consistent building habits.
              </h2>
              <p className="text-[18px] text-slate-600 font-light leading-relaxed mb-8">
                Students work on multi-month projects, practice versioning, and learn
                collaboration until building software feels normal and enjoyable.
                Learners treat complexity as solvable.
              </p>

              <div className="flex flex-wrap gap-3">
                {['Iterative Improvement', 'Version Control', 'Agile Teams', 'Complexity Scaling'].map((tag) => (
                  <span key={tag} className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg font-semibold text-sm">
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="bg-slate-900 rounded-[32px] p-8 md:p-12 relative overflow-hidden">
              <div className="absolute right-0 top-0 w-[300px] h-[300px] bg-primary/20 blur-[80px] rounded-full pointer-events-none" />
              <h3 className="text-[24px] font-playfair font-semibold text-white mb-8 relative z-10">Outcomes</h3>

              <div className="grid sm:grid-cols-2 gap-8 relative z-10">
                {[
                  { stat: 'Multi-Month', label: 'Project Commitment' },
                  { stat: 'Iterative', label: 'Improvement Cycles' },
                ].map((item) => (
                  <div key={item.label} className="border-l border-white/20 pl-6">
                    <div className="text-[36px] font-playfair font-bold text-white mb-1">{item.stat}</div>
                    <div className="text-[14px] text-slate-400 font-medium uppercase tracking-wider">{item.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Problem Solver Stage */}
          <div className="bg-primary/5 rounded-[40px] p-8 md:p-16 border border-primary/10">
            <div className="max-w-3xl">
              <span className="text-sm font-bold text-primary uppercase tracking-widest mb-4 block">Stage 3: The Problem Solver</span>
              <h2 className="text-[32px] md:text-[40px] font-playfair font-semibold text-foreground mb-6">
                Is this worth building?
              </h2>
              <p className="text-lg text-slate-600 mb-12">
                Shift focus from technical capability to user value. Students learn to research,
                test assumptions, and design solutions that respond to real environments.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                { title: "01. Field Observation", desc: "Talk to people, document pain points, and map real behaviors." },
                { title: "02. Hypothesis Testing", desc: "Create low-cost prototypes to test if a solution actually helps." },
                { title: "03. Iterate with Users", desc: "Refine based on feedback until the solution fits the context." }
              ].map((step, i) => (
                <div key={i} className="bg-white p-8 rounded-3xl shadow-sm border border-black/5">
                  <h4 className="text-xl font-playfair font-bold text-primary mb-3">{step.title}</h4>
                  <p className="text-slate-600 text-sm leading-relaxed">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Founder to CEO Stage */}
          <div className="grid lg:grid-cols-[1.5fr_1fr] gap-16 items-center">
            <div className="space-y-8">
              <div>
                <span className="text-sm font-bold text-primary uppercase tracking-widest mb-4 block">Stage 4 & 5: Founder to CEO</span>
                <h2 className="text-[32px] md:text-[40px] font-playfair font-semibold text-foreground mb-6">
                  From projects to ventures.
                </h2>
                <p className="text-lg text-slate-600">
                  As projects mature, students form small teams to learn product-market fit,
                  basic business skills, and how to communicate impact to partners and funders.
                </p>
              </div>

              <div className="grid sm:grid-cols-2 gap-6">
                {[
                  { label: "Team Formation", desc: "Defining roles, responsibilities, and shared goals." },
                  { label: "Early Traction", desc: "Local pilots, user metrics, and community endorsements." },
                  { label: "Pitching & Growth", desc: "Simple financials and storytelling for seed support." },
                  { label: "Evidence of Impact", desc: "Working product with measurable user growth." }
                ].map((item, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="w-6 h-6 rounded-full bg-primary/20 flex-shrink-0 flex items-center justify-center mt-1">
                      <span className="text-[10px] font-bold text-primary">{i + 1}</span>
                    </div>
                    <div>
                      <p className="font-bold text-foreground">{item.label}</p>
                      <p className="text-sm text-slate-500">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 p-8 md:p-12 rounded-[40px] text-center">
              <h3 className="text-2xl font-playfair font-bold mb-6 italic">Success looks like:</h3>
              <div className="space-y-6">
                <div>
                  <p className="text-xs font-bold text-primary uppercase tracking-widest mb-2">Leadership</p>
                  <p className="text-slate-700">Team stewardship, clarity of vision, and resilience.</p>
                </div>
                <div className="w-12 h-[1px] bg-slate-200 mx-auto" />
                <div>
                  <p className="text-xs font-bold text-primary uppercase tracking-widest mb-2">Funding Readiness</p>
                  <p className="text-slate-700">Clear plan for scaling and measurable milestones.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center pt-12">
            <h2 className="text-[32px] md:text-[40px] font-playfair font-semibold text-foreground mb-6">Become a Funded CEO</h2>
            <button className="px-10 py-4 bg-primary text-primary-foreground rounded-full font-bold text-lg hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/20 transition-all"
              onClick={() => router.push("/auth/student/register")}>
              Join the Startup Track
            </button>
          </div>

        </div>
      </section>

      <Footer />
    </>
  );
}
