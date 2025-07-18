import React from 'react';
import '../../styles/trackOrderStatus.css';
import { FaCheck, FaTimes } from 'react-icons/fa';

const steps = ["Placed", "Confirmed", "Shipped", "Out for Delivery", "Delivered"];

const TrackOrderStatus = ({ status, isCancelled = false }) => {
    const currentStep = steps.findIndex(step => step.toLowerCase() === status.toLowerCase());

    return (
        <div className="track-status-container">
            {steps.map((step, index) => {
                let circleContent = null;
                let circleClass = 'circle';

                if (isCancelled) {
                    circleContent = <FaTimes size={12} />;
                    circleClass += ' cancelled';
                } else if (index <= currentStep) {
                    circleContent = <FaCheck size={12} />;
                    circleClass += ' active';
                }

                return (
                    <div className="track-step" key={step}>
                        <div className={circleClass}>
                            {circleContent}
                        </div>
                        {index < steps.length - 1 && (
                            <div className={`line ${index < currentStep && !isCancelled ? 'active' : ''}`} />
                        )}
                        <div className="label">{step}</div>
                    </div>
                );
            })}
        </div>
    );
};

export default TrackOrderStatus;
