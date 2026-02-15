import React from 'react';
import Button from "../../../components/button/Button.jsx";
import Label from "../../../components/label/Label.jsx";
import Input from '../../../components/input/Input.jsx';
import Textarea from "../../../components/textarea/Textarea.jsx";
import PopupMessage from "../../../components/popupmessage/PopupMessage.jsx";
import ErrorMessage from "../../../components/errormessage/ErrorMessage.jsx";
import ImageUploader from "../../../components/imageuploader/ImageUploader.jsx";

const showLogs = import.meta.env.VITE_SHOW_CONSOLE_LOGS === 'true';

const AddProductSection = ({ productTitle, setProductTitle, productDescription, setProductDescription, productImage,
    productImagePreview, setProductImage, setProductImagePreview, fileInputRef, handleImageChange, uploadNewProduct, canSubmitNewProduct,
    loading, isOnline, error, popupMessage, setLoading, setPopupMessage, resetForm, }) => {
    return (
        <section className="admin-section">
            <div className="add-product-section">
                <h2>Add Product:</h2>

                <form
                    className="admin-form"
                    onSubmit={async (e) => {
                        e.preventDefault();
                        setLoading(true);

                        try {
                            const result = await uploadNewProduct({
                                title: productTitle,
                                description: productDescription,
                                image: productImage,
                            });

                            if (result.success) {
                                setPopupMessage('Product was added successfully.');
                                resetForm();
                            }
                        } catch (err) {
                            if (showLogs) {
                                console.error(err);
                            }
                            setPopupMessage('There was a problem adding the product. Please try again.');
                        } finally {
                            setLoading(false);
                        }
                    }}
                >
                    <fieldset className="admin-form">
                        <Label label={<> <span>Title:</span> <span className="required">*</span> </>}>
                            <Input
                                value={productTitle}
                                onChange={(e) => setProductTitle(e.target.value)}
                                required
                                placeholder="Enter the product title"
                                minLength={10}
                                maxLength={30}
                                showCounter={true}
                                showValidation={true}
                            />
                        </Label>

                        <Label label={<> <span>Description:</span> <span className="required">*</span> </>}>
                            <Textarea
                                value={productDescription}
                                onChange={(e) => setProductDescription(e.target.value)}
                                rows={4}
                                required
                                placeholder="Enter the description for this product"
                                minLength={25}
                                maxLength={650}
                                showValidation={true}
                            />
                        </Label>

                        <ImageUploader
                            fileInputRef={fileInputRef}
                            productImage={productImage}
                            productImagePreview={productImagePreview}
                            setProductImage={setProductImage}
                            setProductImagePreview={setProductImagePreview}
                            handleImageChange={handleImageChange}
                        />

                        {error && <ErrorMessage message={error} />}

                        <Button type="submit" disabled={!canSubmitNewProduct || loading || !isOnline}>
                            Create Product
                        </Button>

                        <PopupMessage
                            message={popupMessage}
                            onClose={() => {
                                setPopupMessage('');
                                resetForm();
                            }}
                        />
                    </fieldset>
                </form>
            </div>
        </section>
    );
};

export default AddProductSection;
