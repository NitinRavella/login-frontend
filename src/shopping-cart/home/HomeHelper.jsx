import React, { Component } from 'react';
import { Modal, ModalHeader, ModalBody, Form, FormGroup, Label, Input, Button, InputGroup, InputGroupText, ModalFooter } from 'reactstrap';
import { FaTag, FaInfoCircle, FaListAlt, FaBox, FaImage, FaTrash } from 'react-icons/fa';
import { useDropzone } from 'react-dropzone';
import { toast } from 'react-toastify';

export default class HomeHelper extends Component {

    onDrop = (acceptedFiles) => {
        if (acceptedFiles.length > 0) {
            const file = acceptedFiles[0];
            if (file instanceof File) {
                this.setState({
                    imageFile: file,
                    imagePreview: URL.createObjectURL(file)
                });
            } else {
                toast.error("Invalid file uploaded.");
            }
        }
    };

    renderDropzone = () => {
        const { imagePreview } = this.state;
        const DropzoneArea = () => {
            const { getRootProps, getInputProps } = useDropzone({
                onDrop: this.onDrop,
                onDropRejected: (fileRejections) => {
                    fileRejections.forEach(rejection => {
                        const file = rejection.file;
                        if (file.size > 1048576) {
                            toast.error("File size exceeds 1MB limit!");
                        } else {
                            toast.error("Invalid file. Only image files are allowed.");
                        }
                    });
                },
                accept: { 'image/*': [] },
                multiple: false,
                maxSize: 1048576,
            });

            return (
                <div {...getRootProps()} style={{
                    border: '2px dashed #cccccc',
                    padding: '20px',
                    textAlign: 'center',
                    cursor: 'pointer'
                }}>
                    <input {...getInputProps()} />
                    {imagePreview ? (
                        <img src={imagePreview} alt="Preview" style={{ maxWidth: '100%', maxHeight: '200px' }} />
                    ) : (
                        <p>Drag & drop image here, or click to select (Max size: 1MB)</p>
                    )}
                </div>
            );
        };

        return <DropzoneArea />;
    };

    renderProductModal = (isEdit = false) => {
        const {
            name, description, category, price, stock, imagePreview, imageFile, offerPrice, brand
        } = this.state;

        const submitHandler = isEdit ? this.handleUpdate : this.handleSubmit;
        const modalTitle = isEdit ? "Edit Product" : "Add Product";

        return (
            <Modal isOpen={true} toggle={this.closeModal}>
                <ModalHeader toggle={this.closeModal}>{modalTitle}</ModalHeader>
                <ModalBody>
                    <Form onSubmit={submitHandler}>
                        <FormGroup>
                            <Label htmlFor="name">Name of the Product</Label>
                            <InputGroup>
                                <InputGroupText><FaTag /></InputGroupText>
                                <Input
                                    type="text"
                                    name="name"
                                    value={name}
                                    onChange={this.handleChange}
                                    required
                                />
                            </InputGroup>
                        </FormGroup>
                        <FormGroup>
                            <Label htmlFor="description">Description</Label>
                            <InputGroup>
                                <InputGroupText><FaInfoCircle /></InputGroupText>
                                <Input
                                    type="text"
                                    name="description"
                                    value={description}
                                    onChange={this.handleChange}
                                    required
                                />
                            </InputGroup>
                        </FormGroup>
                        <FormGroup>
                            <Label htmlFor='brand'>Brand</Label>
                            <InputGroup>
                                <InputGroupText><FaTag /></InputGroupText>
                                <Input
                                    type="text"
                                    name="brand"
                                    value={brand}
                                    onChange={this.handleChange}
                                    placeholder="Optional"
                                />
                            </InputGroup>
                        </FormGroup>
                        <FormGroup>
                            <Label htmlFor="price">Price</Label>
                            <InputGroup>
                                <InputGroupText>₹</InputGroupText>
                                <Input
                                    type="text"
                                    name="price"
                                    value={price}
                                    onChange={this.handleChange}
                                    required
                                />
                            </InputGroup>
                        </FormGroup>
                        <FormGroup>
                            <Label htmlFor='offerPrice'>Offer Price</Label>
                            <InputGroup>
                                <InputGroupText>₹</InputGroupText>
                                <Input
                                    type="text"
                                    name="offerPrice"
                                    value={offerPrice}
                                    onChange={this.handleChange}
                                    placeholder="Optional"
                                />
                            </InputGroup>
                        </FormGroup>
                        <FormGroup>
                            <Label htmlFor="category">Category</Label>
                            <InputGroup>
                                <InputGroupText><FaListAlt /></InputGroupText>
                                <Input
                                    type="text"
                                    name="category"
                                    value={category}
                                    onChange={this.handleChange}
                                    required
                                />
                            </InputGroup>
                        </FormGroup>
                        <FormGroup>
                            <Label htmlFor="stock">Stock</Label>
                            <InputGroup>
                                <InputGroupText><FaBox /></InputGroupText>
                                <Input
                                    type="number"
                                    name="stock"
                                    value={stock}
                                    onChange={this.handleChange}
                                    required
                                />
                            </InputGroup>
                        </FormGroup>
                        <FormGroup>
                            <Label>Image</Label>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <FaImage style={{ fontSize: '1.2rem' }} />
                                {this.renderDropzone()}
                            </div>
                            {isEdit && imagePreview && !imageFile && (
                                <img src={imagePreview} alt="Preview" style={{ maxWidth: '100px', marginTop: '10px' }} />
                            )}
                        </FormGroup>
                        <Button type="submit" color="primary">{isEdit ? "Update" : "Add"}</Button>{' '}
                        <Button color="secondary" onClick={this.closeModal}>Cancel</Button>
                    </Form>
                </ModalBody>
            </Modal>
        );
    };

    renderDeleteModal() {
        const { isDeleteModalOpen, deleteConfirmationText } = this.state;
        const isConfirmed = deleteConfirmationText.toLowerCase() === 'yes';

        return (
            <Modal isOpen={isDeleteModalOpen} toggle={this.closeDeleteModal}>
                <ModalHeader toggle={this.closeDeleteModal}>Confirm Delete</ModalHeader>
                <ModalBody>
                    <p>Type <strong>yes</strong> to confirm deletion of this product.</p>
                    <InputGroup>
                        <InputGroupText><FaTrash /></InputGroupText>
                        <Input
                            type="text"
                            value={deleteConfirmationText}
                            onChange={this.handleDeleteConfirmationChange}
                            placeholder="Type yes to confirm"
                        />
                    </InputGroup>
                </ModalBody>
                <ModalFooter>
                    <Button color="danger" disabled={!isConfirmed} onClick={this.confirmDelete}>Delete</Button>
                    <Button color="secondary" onClick={this.closeDeleteModal}>Cancel</Button>
                </ModalFooter>
            </Modal>
        );
    }
}
