import React, { Component } from 'react';
import { Modal, ModalHeader, ModalBody, Form, FormGroup, Label, Input, Button, InputGroup, InputGroupText, ModalFooter, Row, Col, Spinner } from 'reactstrap';
import { FaTag, FaInfoCircle, FaListAlt, FaBox, FaImage, FaTrash, FaTimes, FaMemory, FaHdd, FaRulerCombined, FaPalette, FaMicrochip, FaBoxOpen } from 'react-icons/fa';
import MultiSelectWithOther from '../utils/MultiSelector';
import { useDropzone } from 'react-dropzone';
import { toast } from 'react-toastify';

export default class HomeHelper extends Component {

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
