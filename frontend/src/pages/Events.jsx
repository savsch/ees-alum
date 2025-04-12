import { useState } from "react";
import "../styles/events.css";
import sponsorImage from "../assets/sponsor.jpg"; // Assuming the image is stored in the assets folder
import devbits from "../assets/DEVBITS.svg";
import cassandra from "../assets/CASSANDRA.svg";
import xiota from "../assets/X-IOTA.svg";
import digisim from "../assets/DIGISIM.svg";
import funckit from "../assets/FUNCKIT.svg";
import commnet from "../assets/COMMNET.svg";
import ichip from "../assets/I-CHIP.svg";
import SponsorsSlider from "../components/sponsors";

const backgroundSVGs = [
  devbits,
  cassandra,
  xiota,
  digisim,
  funckit,
  commnet,
  ichip,
];
const eventsData = [
  {
    name: "DEVBITS",
    details:
      "Explore the world of Web Development and Competitive Programming.",
  },
  {
    name: "CASSANDRA",
    details: "Unleash the power of Machine Learning & Data Science.",
  },
  {
    name: "X-IOTA",
    details: "IoT challenges that push the limits of Robotics and Automation.",
  },
  {
    name: "DIGISIM",
    details: "Master Digital Circuit Simulation and Design.",
  },
  {
    name: "FUNCKIT",
    details: "Challenge yourself with coding and circuit puzzles.",
  },
  {
    name: "COMMNET",
    details: "Discover the world of Digital and Analog Communication.",
  },
  {
    name: "I-CHIP",
    details: "Design, simulate, and innovate with advanced chip design.",
  },
];

function Events() {
  const [flipped, setFlipped] = useState(Array(eventsData.length).fill(false));

  const handleFlip = (index) => {
    setFlipped((prev) => {
      const newFlipped = [...prev];
      newFlipped[index] = !newFlipped[index];
      return newFlipped;
    });
  };

  return (
    <div className="events-container">
      {/* UDYAM Section */}
      <div className="udyam-section">
        <h1>UDYAM</h1>
        <p>
          Over the course of more than a decade, <b>UDYAM</b>, the Annual
          Techno-Management Festival hosted by the Department of Electronics
          Engineering at IIT (BHU) Varanasi, has been a cornerstone event. It
          offers a diverse array of competitions in{" "}
          <b>Digital & Analog Electronics, Data Science, Machine Learning</b>,
          and more.
          <br />
          <br />
          Now, poised for its latest edition in <b>2025</b>, UDYAM continues
          fostering <b>technical excellence</b> among Indian technocrats.
        </p>
      </div>

      {/* Sub-Events Section */}
      <div className="sub-events">
        <h2>Sub Events</h2>
        <div className="events-grid">
          {eventsData.map((event, index) => (
            <div
              key={index}
              className="event-card"
              onClick={() => handleFlip(index)}
            >
              <div
                className={`event-card-inner ${
                  flipped[index] ? "flipped" : ""
                }`}
              >
                {/* Front Side */}
                <div className="event-card-front">
                  <div
                    className="event-bg"
                    style={{ backgroundImage: `url(${backgroundSVGs[index]})` }}
                  />
                  <h3>{event.name}</h3>
                  <button>Register</button>
                </div>

                {/* Back Side */}
                <div className="event-card-back">
                  <div
                    className="event-bg"
                    style={{ backgroundImage: `url(${backgroundSVGs[index]})` }}
                  />
                  <p>{event.details}</p>
                  <button>Register</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <SponsorsSlider/>
    </div>
  );
}

export default Events;
