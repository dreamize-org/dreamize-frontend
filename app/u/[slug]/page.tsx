'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Award, Briefcase, ExternalLink, Loader2, MessageSquare, User } from 'lucide-react';
import { publicProfileService, BASE_URL } from '@/services';
import type { PublicStudentProfile } from '@/services/publicProfile';

export default function PublicStudentProfilePage() {
  const params = useParams();
  const slug = params.slug as string;
  const [profile, setProfile] = useState<PublicStudentProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!slug) return;

    publicProfileService
      .getStudentProfile(slug)
      .then((response) => {
        if (response.success && response.data) {
          setProfile(response.data);
        } else {
          setError('This public profile is not available.');
        }
      })
      .catch(() => setError('This public profile is not available.'))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FDF9F2] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-[#FDF9F2] flex items-center justify-center p-8">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-playfair font-semibold text-slate-900 mb-2">Profile unavailable</h1>
          <p className="text-slate-500 mb-6">{error || 'Profile not found.'}</p>
          <Link href="/" className="text-primary font-medium hover:underline">
            Back to Dreamize
          </Link>
        </div>
      </div>
    );
  }

  const avatarSrc = profile.avatarUrl
    ? profile.avatarUrl.startsWith('http')
      ? profile.avatarUrl
      : `${BASE_URL}${profile.avatarUrl}`
    : null;

  return (
    <div className="min-h-screen bg-[#FDF9F2]">
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur-md">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="text-sm font-bold tracking-widest uppercase text-primary">
            Dreamize Africa
          </Link>
          <span className="text-xs text-slate-400 uppercase tracking-widest">Public Portfolio</span>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-10 space-y-10">
        <section className="bg-white rounded-[32px] border border-slate-100 shadow-sm p-8">
          <div className="flex flex-col sm:flex-row gap-6 items-start">
            <div className="w-24 h-24 rounded-[24px] bg-primary/10 flex items-center justify-center overflow-hidden shrink-0">
              {avatarSrc ? (
                <img src={avatarSrc} alt={profile.fullName} className="w-full h-full object-cover" />
              ) : (
                <User className="w-10 h-10 text-primary" />
              )}
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-playfair font-semibold text-slate-900">{profile.fullName}</h1>
              <p className="text-slate-500 mt-2 leading-relaxed">
                {profile.bio || 'Dreamize mentee building real-world tech skills.'}
              </p>
            </div>
          </div>
        </section>

        {profile.certificates.length > 0 && (
          <section>
            <h2 className="text-xl font-playfair font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <Award className="w-5 h-5 text-primary" />
              Certificates
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {profile.certificates.map((certificate) => (
                <div
                  key={certificate._id}
                  className="bg-white rounded-[24px] border border-slate-100 p-5 shadow-sm"
                >
                  <p className="text-xs font-bold uppercase tracking-widest text-primary mb-1">
                    {certificate.certificateNumber}
                  </p>
                  <h3 className="font-semibold text-slate-900">{certificate.milestoneName}</h3>
                  <p className="text-sm text-slate-500 mt-1">Verified by {certificate.trainerName}</p>
                  <p className="text-xs text-slate-400 mt-3">
                    {new Date(certificate.completionDate).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {profile.approvedProjects.length > 0 && (
          <section>
            <h2 className="text-xl font-playfair font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-primary" />
              Approved Projects
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {profile.approvedProjects.map((project) => (
                <div
                  key={project._id}
                  className="bg-white rounded-[24px] border border-slate-100 p-5 shadow-sm"
                >
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">
                    {project.category}
                  </p>
                  <h3 className="font-semibold text-slate-900">{project.title}</h3>
                  <p className="text-sm text-slate-600 mt-2 line-clamp-3">{project.description}</p>
                  {project.toolsUsed?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-3">
                      {project.toolsUsed.slice(0, 4).map((tool) => (
                        <span key={tool} className="px-2 py-0.5 bg-slate-100 rounded-full text-xs text-slate-600">
                          {tool}
                        </span>
                      ))}
                    </div>
                  )}
                  {project.evidence?.demoLink && (
                    <a
                      href={project.evidence.demoLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-sm text-primary mt-4 hover:underline"
                    >
                      View demo <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                  {project.trainerFeedback && (
                    <p className="mt-3 text-sm text-slate-500 italic border-l-2 border-primary pl-3">
                      &quot;{project.trainerFeedback}&quot;
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {profile.trainerFeedback.length > 0 && (
          <section>
            <h2 className="text-xl font-playfair font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-primary" />
              Mentor Feedback
            </h2>
            <div className="space-y-3">
              {profile.trainerFeedback.map((feedback, index) => (
                <blockquote
                  key={index}
                  className="bg-white rounded-[20px] border border-slate-100 p-5 text-slate-600 italic"
                >
                  &quot;{feedback}&quot;
                </blockquote>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
