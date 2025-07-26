import React, {useEffect, useState} from "react";
import './Home.css';
import ProductCard from "../../components/product/ProductCard";
import Button from "../../components/button/Button.jsx";

const Home = () => {
    const [products, setProducts] = useState([]);

    useEffect(() => {
        // Simulate fetching data from a database, to be replaced with http.get
        const fetchSolutions = async () => {
            const dataFromDB = [
                {
                    id: 1,
                    title: "FAMM 3.0",
                    description: " The FAMM 3.0 is the most advanced automatic mounting solution that provides incomparable speed, repeatability, and accuracy. " +
                        "This plate mounting machine represents the 3rd generation of fully automatic mounters and it’s the ideal solution for short and frequent job runs. " +
                        "The FAMM 3.0 features a 30-second mounting speed per plate with an accuracy of 2 microns, while a sleeve change takes only 10 seconds.\n" +
                        "\n" +
                        "- Almost zero operator interaction\n" +
                        "- Extremely accurate & fast mounting\n" +
                        "- Doubles capacity with less costs\n" +
                        "- Robotic handling of sleeves available\n" +
                        "- Robotic mounting and taping available"
                        // "\n" +
                        // "\n" +
                        // "FAMM 3.0 Features\n" +
                        // "1\n" +
                        // "\n" +
                        // "Fully Automatic\n" +
                        // "The flexo plates are positioned fully automatically with the best possible accuracy of 2 microns using a robotic manipulator and the Image Recognition system\n" +
                        // "\n" +
                        // "2\n" +
                        // "\n" +
                        // "Backlight System\n" +
                        // "The third generation of SAMM features backlight technology for improved image recognition of mounting marks, offering optimal illumination for its ultra-high-definition monochrome cameras. The backlight system enhances plate positioning accuracy, increasing SAMM 3.0's precision and efficiency.\n" +
                        // "\n" +
                        // "3\n" +
                        // "\n" +
                        // "Conveyor belt\n" +
                        // "New split conveyor belt with an option to identify the plate from the bottom by reading QR codes. The conveyor backlight and laser line allows plates to be aligned easier.\n" +
                        // "\n" +
                        // "4\n" +
                        // "\n" +
                        // "Robotic manipulator\n" +
                        // "The manipulator picks-up the flexo plate and transfers it on the exact position for mounting. The operator only needs to load the plates on the conveyor belt.\n" +
                        // "\n" +
                        // "5\n" +
                        // "\n" +
                        // "Two automatic pressure rollers (patent pending)\n" +
                        // "The top pressure roller mounts half of the plate, then the mandrel lowers down so that the second pressure roller can mount the rest of the plate. During this time, the pick-up unit has already placed the next plate for mounting.\n" +
                        // "\n" +
                        // "6\n" +
                        // "\n" +
                        // "Automatic linear motors (patent pending)\n" +
                        // "State of the art automatic linear motors that enable fast plate transfer and positioning. The quality check is now 3 times faster.\n" +
                        // "\n" +
                        // "7\n" +
                        // "\n" +
                        // "Automatic mandrel rotation\n" +
                        // "The mandrel makes synchronous movements and rotates automatically, providing operator-free mounting. After mounting, the mandrel unlocks automatically.\n" +
                        // "\n" +
                        // "8\n" +
                        // "\n" +
                        // "LED light sensors\n" +
                        // "The intuitive FAMM software detects if there are informalities during the mounting process. The green light indicates \"processing\", the yellow indicates \"advisory\", while the red means \"error\"."
                },
                {id: 2, title: "SAMM 3.0", description: "Description about the product loaded from database"},
                {id: 3, title: "SAMM 2.0", description: "Description about the product loaded from database"},
                {id: 4, title: "MOM 1300", description: "Description about the product loaded from database"}
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
        // <div className="video-wrapper">
        <div>
            <div className="video-placeholder">
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

            <div className="video-overlay">
                <div className="video-overlay-text-left slide-in">
                    <h1>COMPLETE FLEXO SOLUTIONS</h1>
                </div>

                <div className="video-overlay-text-right slide-in">
                    <h1>FOR EVERY FLEXOGRAPHIC PRINTER</h1>
                </div>

                <div className="video-overlay-text-bottom">
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
                </div>
            </div>

            <main className="content" id="products">
                <h2>Our Products</h2>
                {/* animate on scroll only work on desptop, on mobile the first product is always showsn to fill the screen */}
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
            </main>
        </div>
    );
};

export default Home;