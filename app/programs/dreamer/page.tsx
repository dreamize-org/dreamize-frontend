'use client';

import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { ProgramsNav } from '@/components/programs-nav';
import { PlayfulHero } from '@/components/playful-hero';
import { motion } from 'framer-motion';
import { Sparkles, Brain, Bot, Lightbulb } from 'lucide-react';
import { useRouter } from '@/hooks/useRouter';

export default function DreamerPage() {
  const router = useRouter()
  const steps = [
    {
      phase: '1',
      title: 'Discovery',
      desc: 'Explore different tech fields through fun, interactive projects.',
      icon: <Lightbulb className="w-6 h-6" />
    },
    {
      phase: '2',
      title: 'Curiosity',
      desc: 'Hands-on learning with robotics, coding, and creative tools.',
      icon: <Bot className="w-6 h-6" />
    },
    {
      phase: '3',
      title: 'Inspiration',
      desc: 'See how technology solves real problems in African communities.',
      icon: <Brain className="w-6 h-6" />
    },
    {
      phase: '4',
      title: 'Confidence',
      desc: 'Build skills and genuinely see yourself as a future tech creator.',
      icon: <Sparkles className="w-6 h-6" />
    },
  ];

  return (
    <>
      <Navbar />

      <PlayfulHero
        pillTracker="Stage 1: Dreamer"
        titleLight="Start with"
        titleBold="Imagination"
        titleHighlight="Today"
        description="We invite children to see technology as something they shape. Playful exploration, idea-first activities, and noticing problems in everyday life."
      />

      <ProgramsNav />

      {/* ── CURRICULUM TRACK ── */}
      <section className="py-[100px] px-6 bg-background overflow-hidden">
        <div className="max-w-5xl mx-auto space-y-[120px]">

          {/* Intro block */}
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-[32px] md:text-[40px] font-playfair font-semibold text-foreground mb-6">
              Ideas before tools
            </h2>
            <p className="text-[18px] text-slate-600 font-light leading-relaxed">
              At the Dreamer stage, we focus on curiosity and observation. Children learn to notice local problems
              that could be improved with tech, moving from being mere consumers to active creators through
              hands-on tinkering that builds confidence and agency.
            </p>
          </div>

          {/* Connected Path Layout */}
          <div>
            <div className="flex items-center gap-4 mb-16">
              <div className="w-12 h-[1px] bg-primary/30"></div>
              <h2 className="text-[28px] font-sans font-bold text-slate-800 uppercase tracking-widest">The Dreamer Journey</h2>
              <div className="flex-1 h-[1px] bg-primary/30"></div>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {steps.map((item, index) => (
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.5, delay: index * 0.15 }}
                  key={item.phase}
                  className="relative group pt-12"
                >
                  {/* Visual Connection Line */}
                  {index < steps.length - 1 && (
                    <div className="absolute top-[28px] left-[50%] w-full h-[2px] bg-slate-100 hidden lg:block -z-10" />
                  )}

                  {/* Floating Icon Node */}
                  <div className="absolute top-0 left-6 lg:left-1/2 lg:-translate-x-1/2 w-14 h-14 bg-white border-2 border-primary/20 rounded-full flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white group-hover:scale-110 transition-all duration-300 shadow-md">
                    {item.icon}
                  </div>

                  {/* Content Card */}
                  <div className="bg-slate-50 border border-slate-200 rounded-[24px] p-8 mt-2 h-full group-hover:shadow-xl transition-shadow">
                    <span className="text-primary font-bold text-sm uppercase tracking-wider mb-2 block">Phase {item.phase}</span>
                    <h4 className="text-[22px] font-playfair font-bold text-foreground mb-4">{item.title}</h4>
                    <p className="text-[15px] font-sans text-muted-foreground leading-relaxed">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Matrix Grid */}
          <div className="bg-slate-900 rounded-[40px] p-10 lg:p-16 text-white relative overflow-hidden">
            <div className="absolute -right-32 -top-32 w-96 h-96 bg-primary/20 blur-[100px] rounded-full pointer-events-none" />

            <h2 className="text-[36px] font-playfair font-semibold mb-12 relative z-10">What Dreamers Do</h2>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-10 relative z-10">
              {[
                'Brainstorming & Storytelling',
                'Simple Prototyping',
                'Hands-on Tinkering',
                'Curiosity & Observation',
                'Noticing local problems',
                'Making, not just consuming'
              ].map((item) => (
                <div key={item} className="flex items-start gap-4 group">
                  <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary group-hover:text-white transition-colors">
                    <span className="text-sm font-bold block mt-[2px]">✓</span>
                  </div>
                  <span className="text-[16px] xl:text-[18px] text-slate-300 font-light mt-1 group-hover:text-white transition-colors">{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="text-center">
            <h2 className="text-[32px] md:text-[40px] font-playfair font-semibold text-foreground mb-6">Ready to Dream?</h2>
            <button className="px-10 py-4 bg-primary text-primary-foreground rounded-full font-bold text-lg hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/30 transition-all"
              onClick={() => router.push("/auth/student/register")}>
              Apply for Dreamer Stage
            </button>
          </div>

        </div>
      </section>

      <Footer />
    </>
  );
}
