import React from 'react';
import './About.css';
import Feature from '../components/Feature';
import {
  Shirt,
  User,
  Gem,
  Scissors,
  Sparkles,
  PackageOpen,
  Video,
  Headset,
  RotateCcw,
  UserRound,
  UserRoundCog,
} from 'lucide-react';

export default function About() {
  return (
    <>
      {/* ✅ HERO SECTION START */}
      <section
        className="clothes-hero"
        style={{ backgroundImage: "url('/images/abouthero.jfif')" }}
      >
        <div className="clothes-hero-content">
          <h1>
            Fashion Made Simple.
            <br />
            <span>Everyday.</span>
          </h1>

          <p>
            Discover top-quality Pakistani clothing from your favorite brands.
            Shop unstitched, pret, formals, and accessories — all in one place,
            delivered straight to your home.
          </p>
        </div>

        <div className="clothes-hero-image"></div>
      </section>
      {/* ✅ HERO SECTION END */}

      {/* ✅ CATEGORY SECTION */}
      <div className="main-category-heading">
        <h1>We meet all your Fashion Needs</h1>
      </div>

      <section className="category-section">
        <div className="category-grid compact icons-only">
          <div className="category-card compact">
            <div className="cat-icon big">
              <UserRound size={38} />
            </div>
            <p>Women</p>
          </div>

          <div className="category-card compact">
            <div className="cat-icon big">
              <UserRoundCog size={38} />
            </div>
            <p>Men</p>
          </div>

          <div className="category-card compact">
            <div className="cat-icon big">
              <Gem size={38} />
            </div>
            <p>Accessories</p>
          </div>

          <div className="category-card compact">
            <div className="cat-icon big">
              <Scissors size={38} />
            </div>
            <p>Unstitched</p>
          </div>
        </div>
      </section>
      {/* ✅ CATEGORY SECTION END */}

      {/* ✅ RELIABILITY SECTION (ICONS INSTEAD OF IMAGES) */}
      <section className="reliable-section">
        <h2 className="reliable-heading">Reliable and Simpler</h2>

        <div className="reliable-grid">
          <div className="reliable-card">
            <div className="reliable-icon">
              <PackageOpen size={34} />
            </div>
            <h3>Open Parcel Delivery</h3>
            <p>
              An exclusive service that lets you open the packaging of the
              parcel before payment.
            </p>
          </div>

          <div className="reliable-card">
            <div className="reliable-icon">
              <Video size={34} />
            </div>
            <h3>Packaging Video</h3>
            <p>
              We’ll share a video proof of your ordered item being packaged
              before it’s shipped to you.
            </p>
          </div>

          <div className="reliable-card">
            <div className="reliable-icon">
              <Headset size={34} />
            </div>
            <h3>Customer Support</h3>
            <p>
              Our team is ready to assist you with any issues you may face while
              shopping.
            </p>
          </div>

          <div className="reliable-card">
            <div className="reliable-icon">
              <RotateCcw size={34} />
            </div>
            <h3>Easy Returns</h3>
            <p>
              We make it simple to return items within a few days using our easy
              return policy.
            </p>
          </div>
        </div>
      </section>
      {/* ✅ RELIABILITY SECTION END */}

      {/* ✅ OUR VALUES SECTION */}
      <section className="about-section">
        <div className="about-container">
          <h1 className="about-title">Our Values</h1>

          <div className="about-grid">
            <div
              className="about-card"
              style={{ backgroundImage: "url('/images/story.jfif')" }}
            >
              <h3>Our Story</h3>
              <p>
                VestiVistora began with a vision to make top fashion accessible
                in one place. From traditional to trendy, we curate collections
                from renowned brands like <strong>Sapphire</strong>,{' '}
                <strong>J.</strong>, and <strong>Ideas</strong>.
              </p>
            </div>

            <div
              className="about-card"
              style={{ backgroundImage: "url('/images/mision.jfif')" }}
            >
              <h3>Our Mission</h3>
              <p>
                To redefine shopping convenience by providing authentic brands,
                quality fabric, and the latest styles — all in one digital
                store.
              </p>
            </div>

            <div
              className="about-card"
              style={{ backgroundImage: "url('/images/vision.jfif')" }}
            >
              <h3>Why Choose Us</h3>
              <p>
                We ensure premium quality, original designs, and a smooth online
                shopping experience — blending elegance with trust.
              </p>
            </div>
          </div>

          <div className="about-footer">
            <h2>Discover Fashion That Defines You</h2>
            <p>
              From every stitch to every shade — we bring your style to life.
            </p>
          </div>
        </div>
      </section>
      {/* ✅ OUR VALUES END */}

      {/* ✅ FEATURE SECTION */}
      <Feature />

      {/* ✅ SECOND BANNER SECTION */}
      <section
        className="clothes-hero"
        style={{ backgroundImage: "url('/images/aboutb.jfif')" }}
      >
        <div className="clothes-hero-content">
          <h1>
            Simplify Your <br />
            Buying Needs
          </h1>

          <p>
            Experience elegance and quality with our curated collections —
            bringing luxury fashion to your doorstep.
          </p>
        </div>

        <div className="clothes-hero-image"></div>
      </section>
      {/* ✅ SECOND BANNER END */}
    </>
  );
}
