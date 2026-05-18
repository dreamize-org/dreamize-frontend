'use client';

import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { ProgramsNav } from '@/components/programs-nav';
import { PlayfulHero } from '@/components/playful-hero';
import { motion } from 'framer-motion';
import { Mic, Globe, Presentation, Cpu } from 'lucide-react';
import { useRouter } from '@/hooks/useRouter';

export default function PodcastPage() {
  const router = useRouter()
  const activities = [
    {
      event: 'STEM Workshops',
      desc: 'Hands-on technology activities introducing coding, robotics, and digital design.',
      icon: <Cpu className="w-5 h-5" />
    },
    {
      event: 'Career Days',
      desc: 'Meet tech professionals and learn about diverse career paths in the industry.',
      icon: <Presentation className="w-5 h-5" />
    },
    {
      event: 'Hackathons',
      desc: 'Students compete collaboratively to solve real-world problems with technology.',
      icon: <Globe className="w-5 h-5" />
    },
  ];

  return (
    <>
      <Navbar />

      <PlayfulHero
        pillTracker="Community & Voice"
        titleLight="Podcast &"
        titleBold=""
        titleHighlight="Outreach"
        description="Amplifying African tech voices and building a regional ecosystem of innovation through media and direct engagement."
      />

      <ProgramsNav />

      {/* ── PODCAST CONTENT ── */}
      <section className="py-[100px] px-6 bg-background">
        <div className="max-w-6xl mx-auto space-y-[120px]">

          {/* Podcast Feature */}
          <div className="grid lg:grid-cols-2 gap-16 items-center">

            <div className="order-2 lg:order-1 relative aspect-square md:aspect-video lg:aspect-square bg-slate-900 rounded-[40px] p-8 md:p-12 overflow-hidden flex flex-col justify-between">
              <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-br from-primary/20 to-transparent opacity-50" />

              <div className="bg-white/10 backdrop-blur-md w-16 h-16 rounded-full flex items-center justify-center text-white mb-8 relative z-10 border border-white/20">
                <Mic className="w-8 h-8" />
              </div>

              <div className="relative z-10">
                <span className="text-primary font-bold tracking-widest uppercase text-sm mb-4 block">Tune In</span>
                <h3 className="text-[32px] md:text-[40px] font-playfair font-semibold text-white leading-tight mb-4">
                  Youth Tech Voices
                </h3>
                <p className="text-slate-300 font-light leading-relaxed">
                  Our student-led podcast series explores tech trends, interviews professionals, and showcases projects. It builds immense communication confidence.
                </p>
              </div>
            </div>

            <div className="order-1 lg:order-2">
              <h2 className="text-[32px] md:text-[40px] font-playfair font-semibold text-foreground mb-8">What we cover.</h2>

              <div className="space-y-4">
                {[
                  'Emerging tech trends in Africa',
                  'Career paths in technology',
                  'Student project showcases',
                  'Interviews with tech leaders',
                  'Innovation and entrepreneurship',
                ].map((item, i) => (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: i * 0.1 }}
                    key={item}
                    className="flex items-center gap-4 border-b border-slate-100 pb-4 last:border-0"
                  >
                    <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
                    <span className="text-[18px] text-slate-700 font-light">{item}</span>
                  </motion.div>
                ))}
              </div>
            </div>

          </div>

          {/* Outreach Feature */}
          <div className="bg-slate-50 border border-slate-200 rounded-[40px] p-8 md:p-16">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-[32px] md:text-[40px] font-playfair font-semibold text-foreground mb-6">School Outreach & Events</h2>
              <p className="text-[18px] text-muted-foreground font-light leading-relaxed">
                We organize technology workshops, career events, and STEM challenges in schools across Africa to inspire peers.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {activities.map((item, index) => (
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.15 }}
                  key={item.event}
                  className="bg-white rounded-[24px] p-8 shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                >
                  <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center mb-6">
                    {item.icon}
                  </div>
                  <h4 className="text-[20px] font-bold text-foreground mb-3">{item.event}</h4>
                  <p className="text-slate-500 leading-relaxed font-light">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="text-center">
            <h2 className="text-[32px] md:text-[40px] font-playfair font-semibold text-foreground mb-6">Partner With Us</h2>
            <div className="flex justify-center gap-4">
              <button className="px-8 py-3 border-2 border-slate-300 text-slate-700 rounded-full font-bold hover:border-foreground hover:text-foreground transition-all"
                onClick={() => router.push("/auth/trainer/register")}>
                Become a Trainer
              </button>
            </div>
          </div>

        </div>
      </section>

      <Footer />
    </>
  );
}
