import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import React, { Component } from "react";
import { ButtonGroup } from "react-bootstrap";
import {routeHelper} from "../../helpers/routeHelper";


class TestModal extends Component {
    handleCloseModal = () => {
        this.props.onHide();
        this.props.router.navigate("/tests");
    };

    render() {
        return (
            <Modal {...this.props} size="lg" aria-labelledby="contained-modal-title-vcenter" centered>
                <Modal.Header>
                    <Modal.Title id="contained-modal-title-vcenter">Report Modal</Modal.Title>
                </Modal.Header>
                <Modal.Body className="text-center">
                    <h2>Test results:</h2>
                    <p>Total questions: {this.props.testQuestion.length}</p>
                    <p>Correct answers: {this.props.testQuestion.length - this.props.wrongQuestions.length}</p>
                    <p>Incorrect answers: {this.props.wrongQuestions.length}</p>
                    <ButtonGroup>
                        <Button variant="primary" onClick={this.props.onRunAgain}>Run again</Button>
                        {this.props.wrongQuestions.length > 0 && (
                            <Button variant="warning" onClick={this.props.onRunAgainWithWrongQuestions}>Run again with wrong question</Button>
                        )}
                        <Button variant="danger" onClick={this.handleCloseModal}>Finish</Button>
                    </ButtonGroup>
                </Modal.Body>
                <Modal.Footer>
                </Modal.Footer>
            </Modal>
        );
    }
}

export default routeHelper(TestModal);