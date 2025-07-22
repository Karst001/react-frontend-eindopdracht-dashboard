import React from "react";
import './ProductCard.css';
import famm30 from '../../assets/FAMM3.0.png';
import samm20 from '../../assets/SAMM2.0.png';
import Button from "../../components/button/Button.jsx";
import Image from "../../components/image/Image.jsx";

// Reusable ProductCard to display a product with conditional layout based on direction
const ProductCard = ({ product, direction }) => {
    return (
        // apply dynamic classes for animation and layout direction
        // 'from-left' means image on left, text on right; otherwise reversed
        <div className={`product slide-in ${direction}`}>
            {direction === "from-left" ? (
                <>
                    <div className="image-placeholder">
                        <Image src={famm30} alt="Fully Automated Mounter" />
                    </div>

                    {/* product details on the right */}
                    <div className="description">
                        <strong>{product.title}</strong>
                        <p>{product.description}</p>

                        {/* buttons under the description */}
                        <div className="button-row">
                            <Button >
                                More...
                            </Button>

                            <Button

                                onClick={() => {
                                    window.scrollTo({ top: 0, behavior: 'smooth' });    // smooth scroll to the top of the page
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
                                    window.scrollTo({ top: 0, behavior: 'smooth' });
                                }}
                            >
                                ↑ Back to Top
                            </Button>
                        </div>
                    </div>

                    <div className="image-placeholder">
                        <Image src={samm20} alt="Fully Automated Mounter" />
                    </div>
                </>
            )}
        </div>
    );
};

export default ProductCard;