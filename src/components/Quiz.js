import React, { Component } from "react";
import { ButtonGroup, Card, Container } from "react-bootstrap";
import axios from "axios";
import AuthService from "../services/auth-service";
import { TEST_QUESTION_API_URL } from "../helpers/paths";
import TestModal from "./modals/TestModal";
import { routeHelper } from "../helpers/routeHelper";

class Quiz extends Component {
    constructor(props) {
        super(props);
        this.state = {
            testQuestions: [],
            selectedAnswers: {},
            loading: true,
            error: null,
            showModal: false,
            wrongQuestions: [],
        };
    }

    componentDidMount() {
        this.fetchTestsQuestion();
    }

    fetchTestsQuestion() {
        this.setState({ loading: true, error: null });
        axios
            .get(TEST_QUESTION_API_URL + "get/" + this.props.router.params.testId, {
                headers: {
                    Authorization: `Bearer ${AuthService.getCurrentUser().token}`,
                },
            })
            .then((response) => {
                // Initialize selectedAnswers with empty values
                const selectedAnswers = {};
                response.data.forEach((question) => {
                    selectedAnswers[question.id] = [];
                });

                this.setState({ testQuestions: response.data, selectedAnswers, loading: false });
            })
            .catch((error) => {
                console.error("Error fetching tests:", error);
                this.setState({ loading: false, error: "Error fetching tests" });
                this.props.router.navigate("/tests");
                window.location.reload();
            });
    }

    handleRunAgain = () => {
        this.fetchTestsQuestion();
        this.setState({
            showModal: false,
        });
    }

    handleRunAgainWithWrongQuestions = () => {
        const selectedAnswers = {};
        this.state.testQuestions.forEach((question) => {
            selectedAnswers[question.id] = [];
        });

        this.setState({
            testQuestions: this.state.wrongQuestions,
            selectedAnswers: selectedAnswers,
            wrongQuestions: [],
            showModal: false,
        });
    };

    handleCheckboxChange = (questionId, answerId) => {
        // Update selected answers when checkbox is clicked
        this.setState((prevState) => {
            const selectedAnswers = { ...prevState.selectedAnswers };
            const answerIndex = selectedAnswers[questionId].indexOf(answerId);

            if (answerIndex === -1) {
                selectedAnswers[questionId].push(answerId);
            } else {
                selectedAnswers[questionId].splice(answerIndex, 1);
            }

            return { selectedAnswers };
        });
    };

    handleShowModal = () => {
        this.setState({ showModal: true });
    };

    handleCloseModal = () => {
        this.setState({ showModal: false });
    };

    handleFinishButtonClick = () => {
        console.log("Test Questions:", this.state.testQuestions);
        console.log("Selected answers:", this.state.selectedAnswers);
        const correctQuestions = [];
        const wrongQuestions = [];

        for (const question of this.state.testQuestions) {
            let correct = true;
            for (const answer of question.answers) {
                if ((this.state.selectedAnswers[question.id]?.includes(answer.id) && !answer.correct) ||
                    (!this.state.selectedAnswers[question.id]?.includes(answer.id) && answer.correct)) {
                    correct = false;
                }
            }
            if (!correct) {
                wrongQuestions.push(question);
            }
        }

        this.setState({
            correctQuestions: correctQuestions,
            wrongQuestions: wrongQuestions,
            showModal: true,
        });

        console.log("Correct questions:", correctQuestions);
        console.log("Wrong questions:", wrongQuestions);
    };

    render() {
        console.log(this.state.testQuestions);
        const { testQuestions, selectedAnswers, showModal } = this.state;
        return (
            <Container className="mt-4 mb-4">
                <Card className="p-2">
                    <form onSubmit={(e) => e.preventDefault()}>
                        {testQuestions.map((testQuestion, questionIndex) => (
                            <div className="mb-4" key={questionIndex}>
                                <div className="pb-2 border-bottom">
                                    <h4>{testQuestion.question}</h4>
                                    {testQuestion.imageDto && (
                                        <img
                                            src={`data:image/gif;base64,${testQuestion.imageDto.base64Data}`}
                                            className="img-thumbnail quiz-image"
                                            alt="question"
                                        />
                                    )}
                                </div>
                                {testQuestion.answers.map((answer, index) => (
                                    <div className="form-check" key={index}>
                                        <input
                                            type="checkbox"
                                            className="form-check-input"
                                            id={`answer${answer.id}`}
                                            checked={selectedAnswers[testQuestion.id]?.includes(answer.id)}
                                            onChange={() => this.handleCheckboxChange(testQuestion.id, answer.id)}
                                        />
                                        <label className="form-check-label" htmlFor={`answer${answer.id}`}>
                                            {answer.text}
                                        </label>
                                        <br />
                                        {answer.imageDto && (
                                            <img
                                                src={`data:image/gif;base64,${answer.imageDto.base64Data}`}
                                                className="img-thumbnail quiz-image"
                                                alt="answer"
                                            />
                                        )}
                                    </div>
                                ))}
                            </div>
                        ))}
                        <ButtonGroup>
                            <button onClick={this.handleFinishButtonClick} className="btn btn-primary">
                                Finish
                            </button>
                        </ButtonGroup>
                    </form>
                </Card>
                <TestModal
                    onRunAgain={this.handleRunAgain}
                    onRunAgainWithWrongQuestions={this.handleRunAgainWithWrongQuestions}
                    testQuestion={this.state.testQuestions}
                    wrongQuestions={this.state.wrongQuestions}
                    show={showModal}
                    onHide={this.handleCloseModal}
                />
            </Container>
        );
    }
}

export default routeHelper(Quiz);
