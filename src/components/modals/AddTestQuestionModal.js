import React, {Component} from "react";
import Modal from "react-bootstrap/Modal";
import {Button, ButtonGroup} from "react-bootstrap";
import {QUESTION_API_URL} from "../../helpers/paths";
import AuthService from "../../services/auth-service";
import axios from "axios";

class AddTestQuestionModal extends Component{
    constructor(props) {
        super(props);
        this.state = {
            questions: [],
            loading: true,
            error: null,
        };
    }

    componentDidMount() {
        this.fetchQuestions();
    }

    fetchQuestions() {
        this.setState({ loading: true, error: null });
        axios
            .get(`${QUESTION_API_URL}getAll/user/${AuthService.getCurrentUser().username}`, {
                headers: { Authorization: `Bearer ${AuthService.getCurrentUser().token}` },
            })
            .then((response) => {
                this.setState({ questions: response.data, loading: false });
            })
            .catch((error) => {
                console.error("Error fetching questions:", error);
                this.setState({ loading: false, error: "Error fetching questions" });
            });
    }

    render() {
        const { show, handleClose, handleAddQuestion } = this.props;
        const { questions } = this.state;
        return (
            <Modal show={show}>
                <Modal.Header>
                    <Modal.Title>Add question</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <table className="table">
                    <thead>
                    <tr>
                        <th scope="col">Question</th>
                        <th scope="col">Topic</th>
                        <th scope="col">Answers count</th>
                        <th scope="col">Question</th>
                    </tr>
                    </thead>
                        <tbody>
                        {questions.map((question) => (
                            <tr key={question.id}>
                                <td>{question.title}</td>
                                <td>{question.topic}</td>
                                <td>{question.answers.length}</td>
                                <td>
                                    <ButtonGroup>
                                        <Button
                                            variant="primary"
                                            onClick={() => handleAddQuestion(question.id)}
                                        >
                                            Add
                                        </Button>
                                    </ButtonGroup>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>

                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>
        );
    }
}

export default AddTestQuestionModal;