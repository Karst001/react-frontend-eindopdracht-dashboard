import React from 'react';
import CustomGrid from '../../../components/datagrid/CustomGrid.jsx';
import PopupMessage from "../../../components/popupmessage/PopupMessage.jsx";
import ErrorMessage from "../../../components/errormessage/ErrorMessage.jsx";
import Button from "../../../components/button/Button.jsx";
import Label from "../../../components/label/Label.jsx";
import Input from '../../../components/input/Input.jsx';
import Textarea from "../../../components/textarea/Textarea.jsx";
import ImageUploader from "../../../components/imageuploader/ImageUploader.jsx";
import { fetchProductsFromApi } from "../../../helpers/product_fetch/product.js";

const showLogs = import.meta.env.VITE_SHOW_CONSOLE_LOGS === 'true';

const EditProductSection = ({allProductData, productData, error, popupMessage, resetForm, setPopupMessage,
    showEditModal, setShowEditModal, productToEdit, setProductToEdit, uploadEditedProduct, setLoading, loading, isOnline, setError,
    fileInputRef, productImage, productImagePreview, setProductImage, setProductImagePreview, handleImageChange, setProductData,}) => {
    return (
        <section className="admin-section">
            <h2>Edit products:</h2>

            <>
                <CustomGrid
                    data={allProductData}
                    columns={[
                        { id: 'header', name: 'Title', width: '140px' },
                        { id: 'detail', name: 'Description', width: '300px' },
                        { id: 'discontinued', name: 'Hide?', width: '90px' },
                        { id: 'image', name: 'Image', width: '130px' },
                        { id: 'actions', name: 'Actions', width: '120px' },
                    ]}
                    search={true}
                    pagination={true}
                    pageLimit={5}
                    sort={false}
                />

                {productData.length === 0 && <p>No products found.</p>}
            </>

            {error && <ErrorMessage message={error} />}

            <PopupMessage
                message={popupMessage}
                onClose={() => {
                    setPopupMessage('');
                    resetForm();
                }}
            />

            {/* modal form when user clicks on Edit inside the datagrid */}
            {showEditModal && productToEdit && (
                <div className="modal-overlay">
                    <div className="add-user-section">
                        <h3>Edit Product</h3>

                        <form
                            className="admin-form modal-form"
                            onSubmit={async (e) => {
                                e.preventDefault();
                                setLoading(true);

                                if (isOnline) {
                                    try {
                                        const result = await uploadEditedProduct({
                                            id: productToEdit.id,
                                            title: productToEdit.title,
                                            description: productToEdit.description,
                                            discontinued: productToEdit.discontinued,
                                            newFile: productImage || null,
                                        });

                                        if (result?.success) {
                                            const refreshed = await fetchProductsFromApi(true);

                                            setShowEditModal(false);
                                            setPopupMessage('Product updated successfully.');
                                            setProductData(refreshed);
                                        } else {
                                            setPopupMessage(result?.message || 'Update failed.');
                                        }
                                    } catch (err) {
                                        if (showLogs) {
                                            console.error(err);
                                        }
                                        setPopupMessage('Something went wrong.');
                                    } finally {
                                        setLoading(false);
                                    }
                                } else {
                                    setError('Internet connection not available.');
                                    setLoading(false);
                                }
                            }}
                        >
                            <div className="modal-body">
                                <fieldset className="admin-form">
                                    <Label>
                                        Header:
                                        <Input
                                            type="text"
                                            value={productToEdit.title}
                                            onChange={(e) =>
                                                setProductToEdit({
                                                    ...productToEdit,
                                                    title: e.target.value,
                                                })
                                            }
                                            minLength={10}
                                            maxLength={30}
                                            showValidation={true}
                                            required
                                        />
                                    </Label>

                                    <Label
                                        label={
                                            <>
                                                <span>Description:</span> <span className="required">*</span>
                                            </>
                                        }
                                    >
                                        <Textarea
                                            value={productToEdit.description}
                                            onChange={(e) =>
                                                setProductToEdit({
                                                    ...productToEdit,
                                                    description: e.target.value,
                                                })
                                            }
                                            rows={5}
                                            required
                                            placeholder="Enter the description for this product"
                                            minLength={25}
                                            maxLength={650}
                                            showValidation={true}
                                        />
                                    </Label>

                                    <div className="checkbox-group">
                                        <label className="checkbox-label">
                                            <input
                                                type="checkbox"
                                                checked={productToEdit.discontinued}
                                                onChange={(e) =>
                                                    setProductToEdit({
                                                        ...productToEdit,
                                                        discontinued: e.target.checked,
                                                    })
                                                }
                                            />
                                            Hide on Home page?
                                        </label>
                                    </div>

                                    <ImageUploader
                                        fileInputRef={fileInputRef}
                                        productImage={productImage}
                                        productImagePreview={productImagePreview || productToEdit.imageBase64 || null}
                                        setProductImage={setProductImage}
                                        setProductImagePreview={setProductImagePreview}
                                        handleImageChange={handleImageChange}
                                    />

                                    <PopupMessage
                                        message={popupMessage}
                                        onClose={() => {
                                            setPopupMessage('');
                                        }}
                                    />
                                </fieldset>
                            </div>

                            {error && <ErrorMessage message={error} />}

                            <div className="modal-footer">
                                <Button type="button" onClick={() => setShowEditModal(false)}>
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={loading || !isOnline}>
                                    Save
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </section>
    );
};

export default EditProductSection;
