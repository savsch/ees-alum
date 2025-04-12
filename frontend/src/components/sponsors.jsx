import React from 'react';
import "../styles/sponsor.css";

import nvidia from '../assets/sponsors-1.svg';
import mentorgraphics from '../assets/sponsors-2.svg';
import cisco from '../assets/sponsors-3.svg';
import codechef from '../assets/sponsors-5.svg';
import aptron from '../assets/sponsors-8.svg';
import nullcon from '../assets/sponsors-9.svg';
import coinswitch from '../assets/sponsors-11.svg';
import sensovision from '../assets/sponsors-12.svg';
import silencelab from '../assets/sponsors-14.svg';

const sponsors = [
  { name: 'Nvidia', image: nvidia },
  { name: 'MentorGraphics', image: mentorgraphics },
  { name: 'Cisco', image: cisco },
  { name: 'CodeChef', image: codechef },
  { name: 'Aptron', image: aptron },
  { name: 'Nullcon', image: nullcon },
  { name: 'CoinSwitch Kuber', image: coinswitch },
  { name: 'SensoVision', image: sensovision },
  //{ name: 'Cisco ThingQbator', image: thingqbator },
  { name: 'Silence Laboratories', image: silencelab },
  //{ name: 'Intec Infonet', image: intec }
];

const SponsorsSlider = () => {
  return (
    <div className="slider-section">
      <h2>Our Past Sponsors & Patrons</h2>
      <div className="logo-slider">
        <div className="logo-track">
          {[...sponsors, ...sponsors].map((sponsor, i) => (
            <div className="logo-item" key={i}>
              <img src={sponsor.image} alt={sponsor.name} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SponsorsSlider;