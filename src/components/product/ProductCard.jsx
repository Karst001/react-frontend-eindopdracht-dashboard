import React from "react";
import './ProductCard.css';
import famm30 from '../../assets/FAMM3.0.png';
import samm20 from '../../assets/SAMM2.0.png';
import Button from "../../components/button/Button.jsx";
import Image from "../../components/image/Image.jsx";

// Reusable ProductCard to display a product with conditional layout based on direction
const ProductCard = ({product, direction, animateOnScroll = true}) => {
    // Apply either 'slide-in' (animate for desktop ) or 'visible' (show immediately on page load for mobile)
    const animationClass = animateOnScroll ? 'slide-in' : 'visible';

    // detect if windows is mobile
    const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;

    return (
        // apply dynamic classes for animation and layout direction
        // 'from-left' means image on left, text on right; otherwise reversed
        // <div className={`product slide-in ${direction}`}>
        <div className={`product ${animationClass} ${direction}`}>
            {isMobile ? (
                <>
                    {/* Always image first on mobile, then text, then buttons */}
                    <div className="image-placeholder">
                        <Image src={direction === 'from-left' ? famm30 : samm20} alt={product.title}/>
                    </div>

                    <div className="description">
                        <strong>{product.title}</strong>
                        <p>{product.description}</p>

                        <div className="button-row">
                            <Button>More...</Button>
                            <Button onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}>
                                ↑ Back to Top
                            </Button>
                        </div>
                    </div>
                </>
            ) : (
                <>
                    {/* On desktop alternate image, then text, then buttons */}
                    {direction === "from-left" ? (
                        <>
                            <div className="image-placeholder">
                                <Image src={famm30} alt="Fully Automated Mounter"/>
                            </div>

                            {/* product details on the right */}
                            <div className="description">
                                <strong>{product.title}</strong>
                                <p>{product.description}</p>

                                {/* buttons under the description */}
                                <div className="button-row">
                                    <Button>
                                        More...
                                    </Button>

                                    <Button

                                        onClick={() => {
                                            window.scrollTo({top: 0, behavior: 'smooth'});    // smooth scroll to the top of the page
                                        }}
                                    >
                                        ↑ Back to Top
                                    </Button>
                                </div>
                            </div>
                        </>
                    ) : (
                        <>
                            {/* Reversed layout: text on the left, image on the right */}
                            <div className="description">
                                <strong>{product.title}</strong>
                                <p>{product.description}</p>

                                <div className="button-row">
                                    <Button>
                                        More...
                                    </Button>

                                    <Button
                                        onClick={() => {
                                            window.scrollTo({top: 0, behavior: 'smooth'});
                                        }}
                                    >
                                        ↑ Back to Top
                                    </Button>
                                </div>
                            </div>

                            <div className="image-placeholder">
                                <Image src={samm20} alt="Fully Automated Mounter"/>
                            </div>
                        </>
                    )}
                </>
            )}
        </div>
    );
};

export default ProductCard;