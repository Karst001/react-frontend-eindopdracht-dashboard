import React, {useEffect, useState} from "react";
import './Home.css';
import ProductCard from "../../components/product/ProductCard";
import Button from "../../components/button/Button.jsx";
import { fetchProductsFromApi } from '../../helpers/api/product';
import homePageVideo from "../../assets/web-video.mp4";

const Home = () => {
    const [products, setProducts] = useState([]);

    //call to API to get all the products
    useEffect(() => {
        const loadProducts = async () => {
            const products = await fetchProductsFromApi();
            setProducts(products);
        };

        //the content should scroll over the video
        const handleScroll = () => {
            const videoElement = document.querySelector('.video-placeholder');
            const scrollY = window.scrollY;

            //adjust threshold as needed, like when content starts overlapping by scrolling
            if (scrollY > 85) {
                videoElement.classList.add('hidden');
            } else {
                videoElement.classList.remove('hidden');
            }

            //slide-in logic, as user scrolls down the elements should have an animated slide-in effect
            const elements = document.querySelectorAll('.slide-in');
            elements.forEach((element) => {
                const rectangle = element.getBoundingClientRect();
                if (rectangle.top < window.innerHeight && rectangle.bottom >= 0) {
                    element.classList.add('visible');
                }
            });
        };

        window.addEventListener("scroll", handleScroll);
        loadProducts();
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);


    useEffect(() => {
        const overlays = document.querySelectorAll('.video-overlay-text-left');
        overlays.forEach(el => el.classList.remove('visible'));

        const timer = setTimeout(() => {
            overlays.forEach(el => el.classList.add('visible'));
        }, 500);

        return () => clearTimeout(timer);
    }, []);


    useEffect(() => {
        const overlays = document.querySelectorAll('.video-overlay-text-right');
        overlays.forEach(el => el.classList.remove('visible'));

        const timer = setTimeout(() => {
            overlays.forEach(el => el.classList.add('visible'));
        }, 1250);

        return () => clearTimeout(timer);
    }, []);


    useEffect(() => {
        const overlays = document.querySelectorAll('.video-overlay-text-bottom');
        overlays.forEach(el => el.classList.remove('visible'));

        const timer = setTimeout(() => {
            overlays.forEach(el => el.classList.add('visible'));
        }, 2500);

        return () => clearTimeout(timer);
    }, []);


    return (
        <div>
            {/*video from web server*/}
            {/*<section className="video-placeholder">*/}
            {/*    <video*/}
            {/*        src="https://www.w3schools.com/html/mov_bbb.mp4"*/}
            {/*        width="100%"*/}
            {/*        height="100%"*/}
            {/*        autoPlay*/}
            {/*        muted*/}
            {/*        loop*/}
            {/*        playsInline*/}
            {/*        style={{ objectFit: "cover" }}*/}
            {/*    />*/}
            {/*</section>*/}

            {/*video embedded in site*/}
            {/*convert MPEG first to MP4: as browsers do not support MPEG format*/}
            {/*CloudConvert – reliable, supports .mpg → .mp4.*/}
            {/*Choose MP4 (H.264) as the output format.*/}
            <section className="video-placeholder">
                <video
                    width="100%"
                    height="110%"
                    autoPlay
                    muted
                    loop
                    playsInline
                    style={{ objectFit: "cover" }}
                >
                    <source src={homePageVideo} type="video/mp4" />
                </video>
            </section>

            <div className="video-overlay">
                <header className="video-overlay-text-left slide-in">
                    <h1>COMPLETE FLEXO SOLUTIONS</h1>
                </header>

                <header className="video-overlay-text-right slide-in">
                    <h1>FOR EVERY FLEXOGRAPHIC PRINTER</h1>
                </header>

                <div className="video-overlay-text-bottom">
                    {/*when there are no product yet, hide this Products button, when the Admin loads products it will be displayed*/}
                    {products.length > 0 && (
                        <Button
                            onClick={() => {
                                // scroll to id=products
                                const element = document.getElementById("products");

                                //enable smooth scrolling on button click
                                if (element) {
                                    const targetY = element.getBoundingClientRect().top + window.scrollY - 100;
                                    window.scrollTo({ top: targetY, behavior: 'smooth' });
                                }
                            }}
                        >
                            OUR PRODUCTS
                        </Button>
                    )}
                </div>

            </div>

            <main className="content" id="products">
                {products.length > 0 && (
                    <section>
                        <h2>Our Products</h2>
                        {/* animate on scroll only work on desktop, on mobile the first product is always shown to fill the screen */}
                        {/* once the user scrolls the rest is animated */}
                        {/* index !== 0 means the first one shows */}
                        {products.map((product, index) => (
                            <ProductCard
                                key={product.id}
                                product={product}
                                direction={index % 2 === 0 ? "from-left" : "from-right"}
                                animateOnScroll={
                                    index !== 0 || (typeof window !== 'undefined' && window.innerWidth > 768)
                                }
                            />
                        ))}
                    </section>
                )}
            </main>
        </div>
    );
};

export default Home;