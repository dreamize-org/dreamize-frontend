'use client';

import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { Mail, Phone, MapPin, Send, Book, Clock, Compass, Star, Sun } from 'lucide-react';
import { motion } from 'framer-motion';
import { useRouter } from '@/hooks/useRouter';

export default function ContactPage() {
  const router=useRouter()
  return (
    <>
      <Navbar />
      
      {/* ── AIRY, PLAYFUL HERO ── */}
      <section className="relative pt-[180px] pb-[160px] px-6 bg-[#FDF9F2] overflow-hidden border-b-0">
        
        {/* Floating Decorative Outline Icons */}
        <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.4]">
          <motion.div animate={{ y: [0, -10, 0], rotate: [0, 5, 0] }} transition={{ duration: 6, repeat: Infinity }} className="absolute top-20 left-10 text-slate-800">
            <Star className="w-12 h-12" strokeWidth={1} />
          </motion.div>
          <motion.div animate={{ y: [0, 15, 0], rotate: [0, -10, 0] }} transition={{ duration: 8, repeat: Infinity }} className="absolute top-40 right-20 text-slate-800">
            <Compass className="w-16 h-16" strokeWidth={1} />
          </motion.div>
          <motion.div animate={{ y: [0, -15, 0], rotate: [0, 15, 0] }} transition={{ duration: 7, repeat: Infinity }} className="absolute bottom-40 left-32 text-slate-800">
            <Book className="w-14 h-14" strokeWidth={1} />
          </motion.div>
          <motion.div animate={{ y: [0, 10, 0], rotate: [0, -5, 0] }} transition={{ duration: 5, repeat: Infinity }} className="absolute bottom-20 right-40 text-slate-800">
            <Clock className="w-20 h-20" strokeWidth={1} />
          </motion.div>
          <motion.div animate={{ rotate: [0, 20, 0] }} transition={{ duration: 10, repeat: Infinity }} className="absolute top-32 lg:left-1/3 text-slate-800 opacity-50">
            <Sun className="w-10 h-10" strokeWidth={1} />
          </motion.div>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-4xl mx-auto text-center">
          
          {/* Spark SVG */}
          <div className="relative mb-2 flex justify-center">
             <div className="absolute -top-12 -left-8 md:left-[20%] lg:left-[25%] text-[#FF5A5F] w-8 h-8 rotate-12">
               <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                 <line x1="12" y1="2" x2="12" y2="8"></line>
                 <line x1="5.5" y1="5.5" x2="9" y2="9"></line>
                 <line x1="18.5" y1="5.5" x2="15" y2="9"></line>
               </svg>
             </div>
          </div>

          <div className="relative inline-flex items-center justify-center mb-6">
            <span className="text-sm font-semibold tracking-[0.5px] text-primary bg-primary/20 px-5 py-2 rounded-full border border-primary/10 shadow-sm backdrop-blur-sm">
              Contact Us
            </span>
          </div>

          <h1 className="text-[44px] md:text-[56px] lg:text-[68px] font-playfair font-semibold text-[#1A2A42] leading-[1.1] mb-6 tracking-tight">
            Get in touch for joyful<br /> 
            lear<span className="relative inline-block px-1">
              <span className="relative z-20">ning</span>
              <span className="absolute z-10 inset-0 -top-1 -bottom-1 -left-1 -right-1 bg-primary/30 rounded-[60px] transform -rotate-2"></span>
            </span>
          </h1>
        </div>

        {/* Dense SVG Clouds at the bottom */}
        <div className="absolute bottom-0 left-0 w-full leading-[0] z-20">
          <svg className="relative block w-[calc(100%+1.3px)] h-[100px] md:h-[150px] lg:h-[200px]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M0,70 
                     C50,30 150,-10 250,40 
                     C350,90 400,20 500,50 
                     C600,80 650,10 750,40 
                     C850,70 900,100 1000,50 
                     C1100,0 1150,50 1200,80 
                     L1200,120 L0,120 Z" 
                  fill="#ffffff" />
            <path d="M0,90 
                     C100,50 200,20 300,60 
                     C400,100 450,40 550,70 
                     C650,100 700,50 800,80 
                     C900,110 950,120 1050,70 
                     C1150,20 1200,70 1200,100 
                     L1200,120 L0,120 Z" 
                  fill="#ffffff" opacity="0.7"/>
          </svg>
        </div>
      </section>

      {/* ── CONTACT GRID ── */}
      <section className="py-16 px-6 bg-white relative z-30">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-[1fr_1.2fr] gap-16 items-start">
          
          {/* Contact Info Panel */}
          <div className="order-2 lg:order-1 bg-slate-50 border border-slate-100 rounded-[32px] p-10 md:p-12 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[80px]" />
            <h2 className="text-[32px] font-playfair font-semibold text-foreground mb-4">Connect with us</h2>
            <p className="text-slate-500 font-light mb-12">Whether you want to partner up, enroll a student, or just say hello—our team is ready.</p>
            
            <div className="space-y-8">
              <div className="flex gap-5 items-start group">
                <div className="w-14 h-14 bg-white border border-slate-200 shadow-sm rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                  <Mail className="w-6 h-6 text-primary group-hover:text-white transition-colors" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 mb-1">Email Support</h3>
                  <a href="mailto:dreamizeafrica@gmail.com" className="text-[17px] text-muted-foreground font-light hover:text-primary transition-colors">
                    dreamizeafrica@gmail.com
                  </a>
                </div>
              </div>

              <div className="flex gap-5 items-start group">
                <div className="w-14 h-14 bg-white border border-slate-200 shadow-sm rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                  <Phone className="w-6 h-6 text-primary group-hover:text-white transition-colors" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 mb-1">Call Us</h3>
                  <a href="tel:+250785837748" className="text-[17px] text-muted-foreground font-light hover:text-primary transition-colors">
                    +250 785 837 748
                  </a>
                </div>
              </div>

              <div className="flex gap-5 items-start group">
                <div className="w-14 h-14 bg-white border border-slate-200 shadow-sm rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                  <MapPin className="w-6 h-6 text-primary group-hover:text-white transition-colors" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 mb-1">Headquarters</h3>
                  <p className="text-[17px] text-muted-foreground font-light leading-relaxed max-w-[250px]">
                    Car-Free-Zone (Near Norrsken Kigali House) Rwanda
                  </p>
                </div>
              </div>
            </div>

            {/* Application Paths */}
            <div className="mt-16 pt-8 border-t border-slate-200/60">
              <h3 className="font-semibold text-slate-800 uppercase tracking-widest text-[13px] mb-6">Quick Links</h3>
              <div className="flex flex-wrap gap-3">
                <div className="px-5 py-2.5 bg-white border border-slate-200 rounded-full text-[14px] font-medium text-slate-700 shadow-sm hover:shadow-md hover:border-primary/50 transition-all cursor-pointer"
                onClick={()=>router.push("/auth/student/register")}>
                  Enroll Student
                </div>
                <div className="px-5 py-2.5 bg-white border border-slate-200 rounded-full text-[14px] font-medium text-slate-700 shadow-sm hover:shadow-md hover:border-primary/50 transition-all cursor-pointer"
                onClick={()=>router.push('/auth/trainer/register')}>
                  Become a Mentor
                </div>
              </div>
            </div>
          </div>

          {/* Form Panel */}
          <div className="order-1 lg:order-2 lg:pt-4">
            <div className="bg-white rounded-[32px] border border-black/5 p-8 md:p-12 shadow-[0_20px_50px_rgba(0,0,0,0.05)]">
              <h2 className="text-[32px] md:text-[40px] font-playfair font-semibold text-foreground mb-2">Send a message</h2>
              <p className="text-slate-500 font-light mb-10">We usually reply within 24 hours.</p>
              
              <form className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[14px] font-bold text-slate-800 uppercase tracking-wider mb-2">First Name</label>
                    <input
                      type="text"
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-light"
                      placeholder="Jane"
                    />
                  </div>
                  <div>
                    <label className="block text-[14px] font-bold text-slate-800 uppercase tracking-wider mb-2">Last Name</label>
                    <input
                      type="text"
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-light"
                      placeholder="Doe"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[14px] font-bold text-slate-800 uppercase tracking-wider mb-2">Email Address</label>
                  <input
                    type="email"
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-light"
                    placeholder="jane@example.com"
                  />
                </div>

                <div>
                  <label className="block text-[14px] font-bold text-slate-800 uppercase tracking-wider mb-2">Subject</label>
                  <select className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-light text-slate-600 appearance-none">
                    <option>Select an inquiry type</option>
                    <option>Student Application</option>
                    <option>School Partnership</option>
                    <option>Mentor Inquiry</option>
                    <option>General Question</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[14px] font-bold text-slate-800 uppercase tracking-wider mb-2">Your Message</label>
                  <textarea
                    rows={5}
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-light resize-none"
                    placeholder="Tell us how we can help..."
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="w-full px-8 py-4 bg-primary text-primary-foreground rounded-xl font-bold text-[16px] hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/30 transition-all flex items-center justify-center gap-3 mt-4 group"
                >
                  Send Message
                  <Send className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </form>
            </div>
          </div>

        </div>
      </section>

      <Footer />
    </>
  );
}
