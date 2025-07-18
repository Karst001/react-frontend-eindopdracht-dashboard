import React, { useEffect, useState } from "react";
import './Home.css';
import ProductCard from "../../components/product/ProductCard";
import Button from "../../components/button/Button.jsx";

const Home = () => {
    const [products, setProducts] = useState([]);

    useEffect(() => {
        // Simulate fetching data from a database, to be replaced with http.get
        const fetchSolutions = async () => {
            const dataFromDB = [
                { id: 1, title: "FAMM 3.0", description: "Description about the product loaded from database" },
                { id: 2, title: "SAMM 3.0", description: "Description about the product loaded from database" },
                { id: 3, title: "SAMM 2.0", description: "Description about the product loaded from database" },
                { id: 4, title: "MOM 1300", description: "Description about the product loaded from database" }
            ];
            setProducts(dataFromDB);
        };

        fetchSolutions();

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
        <div className="page">
            <div className="video-placeholder">
                {/*to be replaced with content from customer*/}
                <video
                    src="https://www.w3schools.com/html/mov_bbb.mp4"
                    width="100%"
                    height="100%"
                    autoPlay
                    muted
                    loop
                    playsInline
                    style={{ objectFit: "cover" }}
                />
            </div>

            <div className="video-overlay-text-left slide-in">
                <h1>COMPLETE FLEXO SOLUTIONS</h1>
            </div>

            <div className="video-overlay-text-right slide-in">
                <h1>FOR EVERY FLEXOGRAPHIC PRINTER</h1>
            </div>

            <div className="video-overlay-text-bottom">
                <Button
                    text="OUR PRODUCTS"
                    onClick={() => {
                        const element = document.getElementById("products");
                        if (element) {
                            const targetY = element.getBoundingClientRect().top + window.scrollY - 100;
                            window.scrollTo({ top: targetY, behavior: 'smooth' });
                        }
                    }}
                />
            </div>

            <main className="content" id="products">
                <h2>Our Products</h2>

                {products.map((product, index) => (
                    <ProductCard
                        key={product.id}
                        product={product}
                        direction={index % 2 === 0 ? "from-left" : "from-right"}
                    />
                ))}
            </main>
        </div>
    );
};

export default Home;