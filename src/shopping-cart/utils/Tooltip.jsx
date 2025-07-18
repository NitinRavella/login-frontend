import React, { useState } from 'react';
import '../../styles/tooltip.css';

const Tooltip = ({ children, content, position = 'top' }) => {
    const [visible, setVisible] = useState(false);

    return (
        <div
            className="custom-tooltip-wrapper"
            onMouseEnter={() => setVisible(true)}
            onMouseLeave={() => setVisible(false)}
        >
            {children}
            {visible && (
                <div className={`custom-tooltip-box ${position}`}>
                    {content}
                </div>
            )}
        </div>
    );
};

export default Tooltip;
