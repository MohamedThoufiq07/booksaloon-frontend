import React from 'react';
import { motion } from 'framer-motion';
import { Info, Sparkles, Scissors, Shield, Star, Award, Zap, Phone } from 'lucide-react';
import './About.css';
import salonImage from '../assets/salon_about.png';

const About = () => {
    const services = [
        {
            icon: <Phone size={24} />,
            title: "24/7 Support",
            desc: "Always here for your booking needs."
        },
        {
            icon: <Star size={24} />,
            title: "AI Hair Tracker",
            desc: "Advanced style analysis using BERT-powered technology."
        },
        {
            icon: <Zap size={24} />,
            title: "Fast Booking",
            desc: "Secure your slot in seconds with our smart algorithms."
        },
        {
            icon: <Shield size={24} />,
            title: "Trusted Salons",
            desc: "Only certified and high-rated salons in our network."
        },
        {
            icon: <Award size={24} />,
            title: "Premium Rewards",
            desc: "Earn points and exclusive rewards with every booking."
        },
        {
            icon: <Info size={24} />,
            title: "Smart Reminders",
            desc: "Personalized notifications so you never miss a slot."
        }
    ];

    return (
        <div className="about-container page-fade-in">
            <motion.div
                className="about-header-section"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
            >
                <h1>About <span>BookSaloonz</span></h1>
                <p>
                    A smart ecosystem for premium salon bookings. Experience the future of grooming with our AI-driven platform.
                </p>
            </motion.div>

            <div className="about-content-wrapper">
                <div className="about-left">
                    <div className="services-list">
                        {services.map((service, index) => (
                            <motion.div
                                key={index}
                                className="service-item"
                                initial={{ opacity: 0, x: 0 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                            >
                                <div className="service-icon">
                                    {service.icon}
                                </div>
                                <div className="service-text">
                                    <h3>{service.title}</h3>
                                    <p>{service.desc}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>

                <div className="about-right">
                    <motion.div
                        className="about-image-container"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.6 }}
                    >
                        <img src={salonImage} alt="Premium Salon Interior" />
                        <div className="image-overlay"></div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default About;
