import React from 'react';
import Label from "../../components/label/Label.jsx";

const ImageUploader = ({
                           labelText = "Product image:",
                           required = true,
                           fileInputRef,
                           productImage,
                           productImagePreview,
                           setProductImage,
                           setProductImagePreview,
                           handleImageChange
                       }) => {
    return (
        <Label label={<><span>{labelText}</span> {required && <span className="required">*</span>}</>}>
            <div className="image-upload-wrapper">
                <div
                    className="image-uploader"
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                        e.preventDefault();
                        const file = e.dataTransfer.files[0];
                        if (file) {
                            setProductImage(file);
                            setProductImagePreview(URL.createObjectURL(file));
                        }
                    }}
                >
                    <p>Drag and drop an image here, or click to select</p>

                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="custom-input"
                    />
                </div>

                {productImagePreview && (
                    <div className="image-preview">
                        <img src={productImagePreview} alt="Product Preview" />
                        <p>{productImage.name}</p>
                    </div>
                )}
            </div>
        </Label>
    );
};

export default ImageUploader;
