import React, { Component } from "react";
import axios from "axios";
import { TEST_QUESTION_API_URL } from "../helpers/paths";
import AuthService from "../services/auth-service";
import { Button, Container, Table } from "react-bootstrap";
import Alert from "react-bootstrap/Alert";
import { routeHelper } from "../helpers/routeHelper";
import AddTestQuestionModal from "./modals/AddTestQuestionModal";

class TestQuestions extends Component {
    state = {
        testQuestions: [],
        loading: true,
        error: null,
        addQuestionModalOpen: false,
    };

    componentDidMount() {
        this.fetchTestQuestions();
    }

    fetchTestQuestions = () => {
        const { testId } = this.props.router.params;
        axios
            .get(`${TEST_QUESTION_API_URL}get/${testId}`, {
                headers: {
                    Authorization: `Bearer ${AuthService.getCurrentUser().token}`,
                },
            })
            .then((response) => {
                this.setState({ testQuestions: response.data, loading: false });
            })
            .catch((error) => {
                console.error("Error fetching test questions:", error);
                this.setState({ loading: false, error: "Error fetching test questions" });
            });
    };

    handleRemoveQuestion = (id) => {
        axios
            .delete(`${TEST_QUESTION_API_URL}delete/${id}`, {
                headers: {
                    Authorization: `Bearer ${AuthService.getCurrentUser().token}`,
                },
            })
            .then(this.fetchTestQuestions)
            .catch((error) => {
                console.error("Error deleting test question:", error);
                this.fetchTestQuestions();
            });
    };

    handleAddQuestion = (questionId) => {
        axios
            .post(`${TEST_QUESTION_API_URL}add/${this.props.router.params.testId}/${questionId}`, {}, {
                headers: {
                    Authorization: `Bearer ${AuthService.getCurrentUser().token}`,
                },
            })
            .then(this.fetchTestQuestions)
            .catch((error) => {
                console.error("Error adding test question:", error);
                this.fetchTestQuestions();
            });
    };

    handleOpenModal = () => {
        this.setState({ addQuestionModalOpen: true });
    };

    handleCloseModal = () => {
        this.setState({ addQuestionModalOpen: false });
    };

    render() {
        const { testQuestions, loading } = this.state;

        const noQuestionsMessage = (
            <Container>
                <div className="mb-2">
                    <span className="h2">Test questions:</span>
                    <Button className="float-right" variant="primary" onClick={this.handleOpenModal}>
                        Add question
                    </Button>
                </div>
                <Alert className="alert-warning">No questions to display.</Alert>
                <AddTestQuestionModal
                    show={this.state.addQuestionModalOpen}
                    handleAddQuestion={this.handleAddQuestion}
                    handleClose={this.handleCloseModal}
                    testId={this.props.router.params.testId}
                />
            </Container>
        );

        const renderQuestions = (
            <Container>
                <div className="mb-2">
                    <span className="h2">Test questions:</span>
                    <Button className="float-right" variant="primary" onClick={this.handleOpenModal}>
                        Add question
                    </Button>
                </div>
                <Table striped bordered hover>
                    <thead>
                    <tr>
                        <th>Question</th>
                    </tr>
                    </thead>
                    <tbody>
                    {testQuestions.map((testQuestion) => (
                        <tr key={testQuestion.id}>
                            <td className="d-flex align-items-center">
                                <span>{testQuestion.question}</span>
                                <Button className="btn-sm ml-auto" variant="danger" onClick={() => this.handleRemoveQuestion(testQuestion.id)}>
                                    Remove
                                </Button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </Table>
                <AddTestQuestionModal
                    show={this.state.addQuestionModalOpen}
                    handleClose={this.handleCloseModal}
                    handleAddQuestion={this.handleAddQuestion}
                    testId={this.props.router.params.testId}
                />
            </Container>
        );

        return testQuestions.length === 0 ? noQuestionsMessage : renderQuestions;
    }
}
export default routeHelper(TestQuestions);
