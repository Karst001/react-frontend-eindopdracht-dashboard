//Credits to Google and StackOverflow

import React, { useRef, useEffect } from 'react';
import { Cropper } from 'react-cropper';
import 'cropperjs/dist/cropper.css';
import Button from "../../components/button/Button.jsx";
import './ImageCropper.css';

const ImageCropper = ({ image, fileName, onComplete }) => {
    const cropperRef = useRef(null);

    useEffect(() => {
        document.body.classList.add('no-scroll');
        return () => {
            document.body.classList.remove('no-scroll');
        };
    }, []);

    const handleDone = () => {
        const cropper = cropperRef.current?.cropper;
        if (!cropper) return;

        const canvas = cropper.getCroppedCanvas({
            width: 1200,     // Optional: output size
            height: 900,
        });

        if (!canvas) return;

        canvas.toBlob((blob) => {
            if (blob) {
                const croppedFile = new File([blob], fileName || 'cropped.jpg', {
                    type: 'image/jpeg',
                });
                onComplete(croppedFile);
            }
        }, 'image/jpeg', 1);
    };

    // viewMode={0}: default — allows the image to exceed container
    // viewMode={1}: restricts image to container
    // viewMode={2}: image fits within container but can’t be smaller than crop box
    // viewMode={3}: image must fully cover container

    return (
        <div className="cropper-overlay">
            <div className="cropper-container">
                <Cropper
                    src={image}
                    className="cropper-wrapper"
                    aspectRatio={4.5 / 3}
                    guides={true}
                    viewMode={2}
                    autoCropArea={1}
                    background={false}
                    responsive={true}
                    ref={cropperRef}
                />
                <div className="cropper-controls">
                    <div className="button-group">
                        <Button type="button" onClick={handleDone}>Apply</Button>
                        <Button type="button" onClick={() => onComplete(null)}>Cancel</Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ImageCropper;


