import React from 'react';

const Preloader: React.FC = () => {
    return (
        <div className="simple-preloader">
            <div className="preloader-inner">
                <img src="/logo.png" alt="Loading..." className="preloader-logo-simple" />
                <div className="preloader-spinner-minimal"></div>
            </div>
        </div>
    );
};

export default Preloader;
