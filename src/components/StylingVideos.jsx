import React, { useRef, useState, useEffect } from 'react';
import './StylingVideos.css';
import { X, Volume2, VolumeX, ChevronLeft, ChevronRight } from 'lucide-react';

const videos = [
  {
    id: 1,
    title: 'Glamour Stylo',
    price: 'PKR 6,150',
    oldPrice: '15,000',
    discount: '-59%',
    thumbnail: '/videos/video1.jfif',
    videoUrl: '/videos/video1.mp4',
  },
  {
    id: 2,
    title: 'Zahra Ahmad',
    price: 'PKR 3,960',
    oldPrice: '8,000',
    discount: '-50%',
    thumbnail: '/videos/video2.jfif',
    videoUrl: '/videos/video2.mp4',
  },
  {
    id: 3,
    title: 'Sahibas By Mirza',
    price: 'PKR 6,950',
    oldPrice: '',
    discount: '',
    thumbnail: '/videos/video3.jfif',
    videoUrl: '/videos/video3.mp4',
  },
  {
    id: 4,
    title: 'Alyssa',
    price: 'PKR 7,410',
    oldPrice: '',
    discount: '',
    thumbnail: '/videos/video4.jfif',
    videoUrl: '/videos/video4.mp4',
  },
];

export default function StylingVideos() {
  const [openVideo, setOpenVideo] = useState(null);
  const [muted, setMuted] = useState(true);
  const gridRef = useRef();

  // Scroll lock when modal open
  useEffect(() => {
    document.body.style.overflow = openVideo ? 'hidden' : 'auto';
  }, [openVideo]);

  const scrollGrid = (dir = 'right') => {
    if (!gridRef.current) return;
    const amount = dir === 'right' ? 600 : -600;
    gridRef.current.scrollBy({ left: amount, behavior: 'smooth' });
  };

  return (
    <>
      {/* SECTION */}
      <div className="svx-container">
        <div className="svx-head">
          <h2 className="svx-title">Styling Videos</h2>

          <div className="svx-head-actions">
            <a className="svx-view-all" href="/videos">
              View All
            </a>

            <div className="svx-head-arrows">
              <button className="svx-arrow" onClick={() => scrollGrid('left')}>
                <ChevronLeft size={18} />
              </button>
              <button className="svx-arrow" onClick={() => scrollGrid('right')}>
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </div>

        <div className="svx-grid" ref={gridRef}>
          {videos.map((v) => (
            <div
              key={v.id}
              className="svx-card"
              onClick={() => setOpenVideo(v)}
            >
              <div className="svx-thumb-wrap">
                <img src={v.thumbnail} className="svx-thumb" alt={v.title} />
                <span className="svx-play">▶</span>
              </div>

              <h3 className="svx-name">{v.title}</h3>
              <p className="svx-price">{v.price}</p>
            </div>
          ))}
        </div>
      </div>

      {/* MODAL */}
      {openVideo && (
        <div className="svx-modal">
          <div className="svx-modal-content">
            {/* CLOSE BUTTON */}
            <button className="svx-close" onClick={() => setOpenVideo(null)}>
              <X size={20} />
            </button>

            {/* VIDEO */}
            <div className="svx-video-wrap">
              <video
                src={openVideo.videoUrl}
                className="svx-video"
                controls
                autoPlay
                muted={muted}
              />
              <button className="svx-sound" onClick={() => setMuted(!muted)}>
                {muted ? <VolumeX size={20} /> : <Volume2 size={20} />}
              </button>
            </div>

            {/* PRODUCT CARD */}
            <div className="svx-product-card">
              <img
                src={openVideo.thumbnail}
                className="svx-product-img"
                alt=""
              />

              <div className="svx-product-info">
                <h4 className="svx-product-title">{openVideo.title}</h4>

                <div className="svx-price-row">
                  <span className="svx-current">{openVideo.price}</span>
                  {openVideo.oldPrice && (
                    <>
                      <span className="svx-old">{openVideo.oldPrice}</span>
                      <span className="svx-discount">{openVideo.discount}</span>
                    </>
                  )}
                </div>
              </div>

              <button className="svx-cta">›</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
