import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Heart,
  Sparkles,
  Palette,
  Brush,
  Flower2,
  Droplets,
  Gem,
  Hexagon,
  Gamepad2,
  Pencil,
  BookOpen,
  ArrowRight,
  Github as GithubIcon,
  Moon,
  Sun,
  Wind
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [scrollY, setScrollY] = useState(0);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  const categories = [
    { name: 'Drawing', icon: Pencil, color: 'from-slate-500 to-zinc-500' },
    { name: 'Coloring Book', icon: BookOpen, color: 'from-rose-400 to-pink-400' },
    { name: 'Miniature Painting', icon: Brush, color: 'from-amber-500 to-orange-500' },
    { name: 'Fabric Painting', icon: Palette, color: 'from-purple-400 to-violet-400' },
    { name: 'Flower Vase', icon: Flower2, color: 'from-emerald-400 to-teal-400' },
    { name: 'Watercolor', icon: Droplets, color: 'from-blue-400 to-cyan-400' },
    { name: 'Oil Painting', icon: Sun, color: 'from-yellow-500 to-amber-500' },
    { name: 'Jewelry', icon: Gem, color: 'from-pink-400 to-rose-400' },
    { name: 'Pattern Art', icon: Hexagon, color: 'from-indigo-400 to-purple-400' },
    { name: 'Game Character', icon: Gamepad2, color: 'from-cyan-500 to-blue-500' },
  ];

  const parallaxOffset = scrollY * 0.5;
  const mouseParallaxX = (mousePosition.x - window.innerWidth / 2) * 0.02;
  const mouseParallaxY = (mousePosition.y - window.innerHeight / 2) * 0.02;

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Animated Background - Calmer, softer tones */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div
          className="absolute inset-0 opacity-15"
          style={{
            backgroundImage: `
              linear-gradient(to right, #334155 1px, transparent 1px),
              linear-gradient(to bottom, #334155 1px, transparent 1px)
            `,
            backgroundSize: '64px 64px',
            transform: `translate(${mouseParallaxX}px, ${mouseParallaxY}px)`,
            transition: 'transform 0.5s ease-out',
          }}
        />

        {/* Gradient Orbs - Softer, calmer colors */}
        <div
          className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-emerald-600/15 rounded-full blur-3xl"
          style={{ transform: `translate(${-parallaxOffset}px, ${parallaxOffset * 0.5}px)` }}
        />
        <div
          className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-teal-600/15 rounded-full blur-3xl"
          style={{ transform: `translate(${parallaxOffset}px, ${-parallaxOffset * 0.5}px)` }}
        />
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-cyan-600/10 rounded-full blur-3xl"
        />
      </div>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-6">
        <div className="max-w-6xl mx-auto text-center z-10">
          {/* Logo */}
          <div
            className="inline-flex items-center gap-4 mb-8 animate-in fade-in slide-in-from-top duration-700"
            style={{ transform: `translateY(${parallaxOffset * 0.3}px)` }}
          >
            <Heart className="w-14 h-14 text-emerald-400" strokeWidth={1.5} />
            <h1 className="text-7xl font-black tracking-tighter bg-gradient-to-r from-slate-100 via-emerald-200 to-teal-200 bg-clip-text text-transparent">
              Me Time
            </h1>
          </div>

          {/* Tagline */}
          <h2
            className="text-5xl md:text-6xl font-bold mb-6 leading-tight animate-in fade-in slide-in-from-bottom duration-700 delay-150"
            style={{ transform: `translateY(${parallaxOffset * 0.2}px)` }}
          >
            Slow down. Create.
            <br />
            <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
              Breathe.
            </span>
          </h2>

          {/* Subtext */}
          <p
            className="text-xl text-slate-400 mb-12 max-w-2xl mx-auto leading-relaxed animate-in fade-in slide-in-from-bottom duration-700 delay-300"
            style={{ transform: `translateY(${parallaxOffset * 0.15}px)` }}
          >
            Turn free time into moments of presence and peace.
            Simple, calming creative activities that help you reconnect with yourself.
          </p>

          {/* CTA Button */}
          <button
            onClick={() => navigate('/canvas')}
            className="group relative inline-flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl font-bold text-lg shadow-2xl shadow-emerald-900/50 hover:shadow-emerald-900/80 transition-all duration-300 hover:scale-105 active:scale-95 animate-in fade-in slide-in-from-bottom duration-700 delay-500"
            style={{ transform: `translateY(${parallaxOffset * 0.1}px)` }}
          >
            <Wind className="w-6 h-6" />
            Begin Your Moment
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />

            {/* Glow effect */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 blur-xl opacity-50 group-hover:opacity-75 transition-opacity -z-10" />
          </button>

          {/* Scroll Indicator */}
          <div
            className="absolute bottom-12 left-1/2 -translate-x-1/2 animate-bounce"
            style={{ opacity: Math.max(0, 1 - scrollY / 300) }}
          >
            <div className="w-6 h-10 border-2 border-slate-600 rounded-full flex items-start justify-center p-2">
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
            </div>
          </div>
        </div>
      </section>

      {/* Philosophy Section */}
      <section className="relative py-32 px-6 bg-slate-900/30">
        <div className="max-w-4xl mx-auto text-center">
          <Moon className="w-12 h-12 text-teal-400 mx-auto mb-8" />
          <h3
            className="text-3xl md:text-4xl font-bold mb-8 bg-gradient-to-r from-slate-100 to-slate-400 bg-clip-text text-transparent"
            style={{
              opacity: Math.min(1, Math.max(0, (scrollY - 300) / 200)),
            }}
          >
            Rest your mind while gently engaging it
          </h3>
          <p className="text-lg text-slate-400 leading-relaxed max-w-2xl mx-auto">
            Instead of asking you to "clear your mind," Me Time gives you something gentle to focus on.
            This makes calm more accessible, especially for people who find traditional meditation
            difficult or intimidating.
          </p>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="relative py-32 px-6">
        <div className="max-w-6xl mx-auto">
          <h3
            className="text-4xl font-bold text-center mb-20 bg-gradient-to-r from-slate-100 to-slate-400 bg-clip-text text-transparent"
            style={{
              opacity: Math.min(1, Math.max(0, (scrollY - 600) / 200)),
              transform: `translateY(${Math.max(0, 50 - (scrollY - 600) * 0.2)}px)`
            }}
          >
            Your Journey to Calm
          </h3>

          <div className="grid md:grid-cols-3 gap-12">
            {[
              {
                step: '01',
                title: 'Choose Your Moment',
                description: 'Pick from 10 calming creative activities. Each one designed to help you slow down and be present.',
                icon: Heart,
                delay: 0,
              },
              {
                step: '02',
                title: 'Flow into Creation',
                description: 'Follow gentle, step-by-step guidance. No pressure, no skill requirements—just peaceful making.',
                icon: Sparkles,
                delay: 200,
              },
              {
                step: '03',
                title: 'Find Your Peace',
                description: 'Experience flow—that state where time slows and focus feels natural. This is your me time.',
                icon: Moon,
                delay: 400,
              },
            ].map((item, index) => (
              <div
                key={item.step}
                className="relative group"
                style={{
                  opacity: Math.min(1, Math.max(0, (scrollY - 800 - index * 100) / 200)),
                  transform: `translateY(${Math.max(0, 80 - (scrollY - 800 - index * 100) * 0.3)}px)`,
                }}
              >
                {/* Card */}
                <div className="relative bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-2xl p-8 h-full transition-all duration-500 hover:border-emerald-500/50 hover:shadow-2xl hover:shadow-emerald-900/20 hover:-translate-y-2">
                  {/* Step Number */}
                  <div className="absolute -top-6 -left-6 w-16 h-16 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-2xl flex items-center justify-center font-black text-2xl shadow-xl rotate-12 group-hover:rotate-0 transition-transform duration-500">
                    {item.step}
                  </div>

                  {/* Icon */}
                  <div className="mb-6 mt-4">
                    <div className="w-16 h-16 bg-slate-800 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <item.icon className="w-8 h-8 text-emerald-400" />
                    </div>
                  </div>

                  {/* Content */}
                  <h4 className="text-2xl font-bold mb-4 text-slate-100">{item.title}</h4>
                  <p className="text-slate-400 leading-relaxed">{item.description}</p>

                  {/* Hover Glow */}
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-emerald-600/0 to-teal-600/0 group-hover:from-emerald-600/5 group-hover:to-teal-600/5 transition-all duration-500 pointer-events-none" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="relative py-32 px-6">
        <div className="max-w-6xl mx-auto">
          <h3
            className="text-4xl font-bold text-center mb-6 bg-gradient-to-r from-slate-100 to-slate-400 bg-clip-text text-transparent"
            style={{
              opacity: Math.min(1, Math.max(0, (scrollY - 1400) / 200)),
              transform: `translateY(${Math.max(0, 50 - (scrollY - 1400) * 0.2)}px)`
            }}
          >
            10 Calming Activities
          </h3>
          <p
            className="text-center text-slate-400 mb-16 text-lg"
            style={{
              opacity: Math.min(1, Math.max(0, (scrollY - 1450) / 200)),
            }}
          >
            Each one designed for mindful doing—small, peaceful moments that fit naturally into everyday life
          </p>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
            {categories.map((category, index) => (
              <div
                key={category.name}
                className="group relative"
                style={{
                  opacity: Math.min(1, Math.max(0, (scrollY - 1600 - index * 30) / 150)),
                  transform: `translateY(${Math.max(0, 60 - (scrollY - 1600 - index * 30) * 0.4)}px) scale(${Math.min(1, Math.max(0.9, 0.9 + (scrollY - 1600 - index * 30) / 500))})`,
                }}
              >
                <div className="relative bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-2xl p-6 aspect-square flex flex-col items-center justify-center text-center transition-all duration-500 hover:border-slate-700 hover:shadow-2xl hover:-translate-y-2 cursor-pointer">
                  {/* Icon with gradient background */}
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${category.color} p-0.5 mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <div className="w-full h-full bg-slate-900 rounded-xl flex items-center justify-center">
                      <category.icon className="w-7 h-7 text-white" />
                    </div>
                  </div>

                  {/* Name */}
                  <h4 className="font-bold text-slate-100 text-xs">{category.name}</h4>

                  {/* Hover Glow */}
                  <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${category.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500 blur-xl`} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="relative py-32 px-6 bg-slate-900/30">
        <div className="max-w-6xl mx-auto">
          <h3
            className="text-4xl font-bold text-center mb-6 bg-gradient-to-r from-slate-100 to-slate-400 bg-clip-text text-transparent"
            style={{
              opacity: Math.min(1, Math.max(0, (scrollY - 2200) / 200)),
              transform: `translateY(${Math.max(0, 50 - (scrollY - 2200) * 0.2)}px)`
            }}
          >
            Why Mindful Creation Works
          </h3>
          <p
            className="text-center text-slate-400 mb-16 text-lg"
            style={{
              opacity: Math.min(1, Math.max(0, (scrollY - 2250) / 200)),
            }}
          >
            The science and soul behind Me Time
          </p>

          <div className="grid md:grid-cols-2 gap-8">
            {[
              {
                title: 'Shift Out of Stress',
                description: 'Simple creative actions activate the parasympathetic nervous system, naturally calming your body without long meditation sessions.',
                gradient: 'from-emerald-500 to-teal-500',
              },
              {
                title: 'Be Present Through Doing',
                description: 'Hands-on creative activities anchor you to the present moment. Your mind naturally slows as you focus on gentle, repetitive actions.',
                gradient: 'from-teal-500 to-cyan-500',
              },
              {
                title: 'Experience Natural Flow',
                description: 'Enter the flow state—where time seems to slow and focus feels effortless. Creative work is one of the most accessible paths to flow.',
                gradient: 'from-cyan-500 to-blue-500',
              },
              {
                title: 'Create Without Pressure',
                description: 'No skill requirements, no performance expectations. Just gentle expression that meets you exactly where you are.',
                gradient: 'from-blue-500 to-indigo-500',
              },
            ].map((feature, index) => (
              <div
                key={feature.title}
                className="group relative"
                style={{
                  opacity: Math.min(1, Math.max(0, (scrollY - 2400 - index * 100) / 200)),
                  transform: `translateY(${Math.max(0, 60 - (scrollY - 2400 - index * 100) * 0.3)}px)`,
                }}
              >
                <div className="relative bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-2xl p-8 h-full transition-all duration-500 hover:border-slate-700 hover:shadow-2xl hover:-translate-y-2">
                  <div className={`w-12 h-1 rounded-full bg-gradient-to-r ${feature.gradient} mb-6`} />
                  <h4 className="text-2xl font-bold mb-4 text-slate-100">{feature.title}</h4>
                  <p className="text-slate-400 leading-relaxed">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="relative py-32 px-6">
        <div
          className="max-w-4xl mx-auto text-center"
          style={{
            opacity: Math.min(1, Math.max(0, (scrollY - 3000) / 300)),
            transform: `translateY(${Math.max(0, 80 - (scrollY - 3000) * 0.3)}px)`
          }}
        >
          <div className="relative bg-gradient-to-br from-emerald-900/30 to-teal-900/30 backdrop-blur-xl border border-emerald-500/30 rounded-3xl p-16 overflow-hidden">
            {/* Animated background pattern */}
            <div className="absolute inset-0 opacity-10">
              <div
                className="absolute inset-0"
                style={{
                  backgroundImage: `
                    radial-gradient(circle at 25% 25%, #10b981 2px, transparent 2px),
                    radial-gradient(circle at 75% 75%, #14b8a6 2px, transparent 2px)
                  `,
                  backgroundSize: '60px 60px',
                  animation: 'float 20s linear infinite',
                }}
              />
            </div>

            <Heart className="w-16 h-16 text-emerald-400 mx-auto mb-6" />
            <h3 className="text-5xl font-bold mb-6 relative z-10">
              Your moment of peace awaits
            </h3>
            <p className="text-xl text-slate-300 mb-10 relative z-10">
              Start your journey to calm through mindful creation.
            </p>
            <button
              onClick={() => navigate('/canvas')}
              className="group relative inline-flex items-center gap-3 px-12 py-6 bg-white text-slate-900 rounded-2xl font-bold text-xl shadow-2xl hover:shadow-white/20 transition-all duration-300 hover:scale-105 active:scale-95 z-10"
            >
              <Wind className="w-6 h-6" />
              Begin Your Moment
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative border-t border-slate-800 py-12 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <Heart className="w-8 h-8 text-emerald-400" />
            <span className="font-bold text-lg">Me Time</span>
          </div>

          <div className="flex items-center gap-8 text-sm text-slate-400">
            <span>Mindful moments, one creation at a time</span>
          </div>
        </div>
      </footer>

      {/* CSS Animation */}
      <style>{`
        @keyframes float {
          0% { transform: translate(0, 0); }
          50% { transform: translate(10px, 10px); }
          100% { transform: translate(0, 0); }
        }
      `}</style>
    </div>
  );
};
