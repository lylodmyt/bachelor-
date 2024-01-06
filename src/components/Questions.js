import React, { Component } from "react";
import { Alert, Button, Container } from "react-bootstrap";
import AuthService from "../services/auth-service";
import axios from "axios";
import { QUESTION_API_URL } from "../helpers/paths";
import { routeHelper } from "../helpers/routeHelper";
import CreateQuestionModal from "./modals/CreateQuestionModal";
import EditQuestionModal from "./modals/EditQuestionModal";

class Questions extends Component {
    constructor(props) {
        super(props);
        this.state = {
            questions: [],
            loading: true,
            showModal: false,
            selectedQuestionId: null,
        };
    }

    componentDidMount() {
        this.fetchQuestions();
    }

    fetchQuestions() {
        this.setState({ loading: true, error: null });
        const { topicId } = this.props.router.params;

        axios
            .get(`${QUESTION_API_URL}getAll/${topicId}`, {
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

    handleDeleteQuestion = (id) => {
        axios
            .delete(`${QUESTION_API_URL}delete/${id}`, {
                headers: { Authorization: `Bearer ${AuthService.getCurrentUser().token}` },
            })
            .then(() => this.fetchQuestions())
            .catch((error) => {
                console.error("Error deleting question:", error);
            });
    };

    handleOpenQuestionModal = () => {
        this.setState({ showModal: true, selectedQuestionId: null });
    };

    handleOpenEditQuestionModal = (id) => {
        this.setState({ showModal: true, selectedQuestionId: id });
    };

    handleCloseQuestionModal = () => {
        this.setState({ showModal: false, selectedQuestionId: null });
        this.fetchQuestions();
    };

    renderQuestions() {
        const { questions } = this.state;

        return (
            <ul>
                {questions.map((question) => (
                    <li key={question.id} className="m-3">
                        <span className="mr-2">{question.title}</span>
                        <Button
                            className="btn-sm mr-2"
                            variant="warning"
                            onClick={() => this.handleOpenEditQuestionModal(question.id)}
                        >
                            Edit
                        </Button>
                        <Button
                            className="btn-sm mr-2"
                            variant="danger"
                            onClick={() => this.handleDeleteQuestion(question.id)}
                        >
                            Delete
                        </Button>
                    </li>
                ))}
            </ul>
        );
    }

    render() {
        const { loading, showModal, selectedQuestionId } = this.state;

        return (
            <Container>
                <div className="mb-2">
                    <span className="h2">Questions:</span>
                    <Button
                        className="float-right"
                        variant="primary"
                        onClick={this.handleOpenQuestionModal}
                    >
                        Create question
                    </Button>
                </div>
                {this.renderQuestions()}
                {!loading && this.state.questions.length === 0 && (
                    <Alert className="alert-warning">No questions to display.</Alert>
                )}
                <CreateQuestionModal
                    topicId={this.props.router.params.topicId}
                    show={showModal && !selectedQuestionId}
                    handleClose={this.handleCloseQuestionModal}
                />
                <EditQuestionModal
                    topicId={this.props.router.params.topicId}
                    show={showModal && selectedQuestionId !== null}
                    handleClose={this.handleCloseQuestionModal}
                    questionId={selectedQuestionId}
                />
            </Container>
        );
    }
}

export default routeHelper(Questions);
