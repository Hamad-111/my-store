import React from 'react';
import './Career.css';
import { motion } from 'framer-motion';
import { Briefcase, Camera, PenTool, Users } from 'lucide-react';

export default function Career() {
  return (
    <div className="career-page">
      {/* Hero Section */}
      <section className="career-hero">
        <motion.h1
          className="career-title"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          Join Our Creative Team
        </motion.h1>
        <motion.p
          className="career-subtitle"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
        >
          Be part of Pakistan’s most passionate clothing brand. We’re building
          something beautiful — together.
        </motion.p>
      </section>

      {/* About Section */}
      <section className="career-about">
        <motion.div
          className="career-about-content"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h2>Why Join Us?</h2>
          <p>
            We’re more than just a brand — we’re a family of designers,
            storytellers, and dreamers shaping the future of fashion in
            Pakistan. When you join us, you don’t just work; you grow, create,
            and make an impact.
          </p>
        </motion.div>

        <motion.img
          src="https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=1200&q=80"
          alt="Team working"
          className="career-about-image"
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
        />
      </section>

      {/* Job Openings */}

      {/* CTA Section */}
      <section className="career-cta">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          Don’t see a position for you?
        </motion.h2>
        <p>
          Send us your CV at <strong>careers@yourbrand.com</strong>
        </p>
        <motion.a
          href="mailto:careers@yourbrand.com"
          className="cta-btn"
          whileHover={{ scale: 1.05 }}
        >
          Get in Touch
        </motion.a>
      </section>
    </div>
  );
}
