import React, { Component } from "react";
import { Modal, Form, Button, Alert } from "react-bootstrap";
import axios from "axios";
import AuthService from "../../services/auth-service";
import { ANSWER_API_URL, IMAGE_API_URL, QUESTION_API_URL } from "../../helpers/paths";

class CreateQuestionModal extends Component {
    constructor(props) {
        super(props);

        this.state = {
            questionText: "",
            questionImage: null,
            answers: [],
            errorMessage: "",
        };
    }

    handleClose = () => {
        this.setState({
            questionText: "",
            questionImage: null,
            answers: [],
            errorMessage: "",
        });
        this.props.handleClose();
    };

    handleAddAnswer = () => {
        this.setState((prevState) => ({
            answers: [...prevState.answers, { text: "", correct: false, image: null }],
        }));
    };

    handleRemoveAnswer = (index) => {
        this.setState((prevState) => {
            const updatedAnswers = [...prevState.answers];
            updatedAnswers.splice(index, 1);
            return { answers: updatedAnswers };
        });
    };

    handleCheckboxChange = (index) => {
        const { answers } = this.state;
        const updatedAnswers = [...answers];
        if (updatedAnswers[index].correct === true){
            updatedAnswers[index].correct = false;
            this.setState({ answers: updatedAnswers });
        } else {
            updatedAnswers[index].correct = true;
            this.setState({ answers: updatedAnswers });
        }
    };

    handleImageChange = (property, index, e) => {
        const { answers } = this.state;
        const updatedArray = [...answers];
        updatedArray[index].image = e.target.files[0];

        const reader = new FileReader();
        reader.onload = (event) => {
            updatedArray[index].imagePreview = event.target.result;
            this.setState({ answers: updatedArray });
        };
        reader.readAsDataURL(e.target.files[0]);
    };

    handleRemoveImage = (index) => {
        const { answers } = this.state;
        const updatedArray = [...answers];
        updatedArray[index].image = null;
        updatedArray[index].imagePreview = null;

        this.setState({ answers: updatedArray });
    };

    handleQuestionImageChange = (e) => {
        this.setState({ questionImage: e.target.files[0] });

        const reader = new FileReader();
        reader.onload = (event) => {
            this.setState({ questionImagePreview: event.target.result });
        };
        reader.readAsDataURL(e.target.files[0]);
    };

    handleCreateQuestion = async () => {
        try {
            const { questionText, questionImage, answers } = this.state;
            if (!questionText) {
                this.setState({ errorMessage: "Question must not be empty." });
                return;
            } else if (answers.length < 2) {
                this.setState({ errorMessage: "There must be at least 2 answers." });
                return;
            } else if (answers.filter((answer) => answer.correct).length === 0) {
                this.setState({ errorMessage: "There must be at least 1 correct answer." });
                return;
            } else if (answers.some((answer) => !answer.text)) {
                this.setState({ errorMessage: "Answer text must not be empty." });
                return;
            }

            const questionDto = {
                title: questionText,
                topicId: this.props.topicId,
                username: AuthService.getCurrentUser().username,
            };

            const questionResponse = await axios.post(
                QUESTION_API_URL + "create",
                questionDto,
                {
                    headers: {
                        Authorization: `Bearer ${AuthService.getCurrentUser().token}`,
                    },
                }
            );

            const questionId = questionResponse.data.id;

            if (questionImage) {
                const formData = new FormData();
                formData.append("image", questionImage);
                await axios.post(IMAGE_API_URL + `question/${questionId}`, formData, {
                    headers: {
                        Authorization: `Bearer ${AuthService.getCurrentUser().token}`,
                    },
                });
            }

            const answerDtos = answers.map((answer) => ({
                text: answer.text,
                correct: answer.correct,
                questionId: questionId,
            }));

            const answersResponse = await axios.post(
                ANSWER_API_URL + `addAnswers/${questionId}`,
                answerDtos,
                {
                    headers: {
                        Authorization: `Bearer ${AuthService.getCurrentUser().token}`,
                    },
                }
            );

            for (let i = 0; i < answersResponse.data.length; i++) {
                const answer = answersResponse.data[i];
                if (answers[i].image) {
                    const formData = new FormData();
                    formData.append("image", answers[i].image);
                    await axios.post(IMAGE_API_URL + `answer/${answer.id}`, formData, {
                        headers: {
                            Authorization: `Bearer ${AuthService.getCurrentUser().token}`,
                        },
                    });
                }
            }
            this.handleClose();
        } catch (error) {
            this.setState({ errorMessage: "An error occurred while creating the question." });
        }
    };

    render() {
        const { show } = this.props;
        const { questionText, answers, errorMessage } = this.state;

        return (
            <Modal show={show}>
                <Modal.Header>
                    <Modal.Title>Create Question</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        {errorMessage && <Alert variant="danger">{errorMessage}</Alert>}
                        <Form.Group controlId="questionText">
                            <h3>Question</h3>
                            <Form.Control
                                className="mb-2"
                                type="text"
                                placeholder="Enter your question here"
                                value={questionText}
                                onChange={(e) => this.setState({ questionText: e.target.value })}
                            />
                            {!this.state.questionImage ? (
                                <div className="custom-file mb-2">
                                    <input
                                        type="file"
                                        className="custom-file-input"
                                        id="customQuestionImage"
                                        onChange={this.handleQuestionImageChange}
                                    />
                                    <label className="custom-file-label" htmlFor="customQuestionImage">
                                        {this.state.questionImage ? this.state.questionImage.name : "Add image"}
                                    </label>
                                </div>
                            ) : (
                                <div className="text-center mb-2">
                                    <div>
                                        <img
                                            src={this.state.questionImagePreview}
                                            className="quiz-image"
                                            alt="Question image"
                                        />
                                    </div>
                                    <Button className="btn-sm" variant="danger" onClick={() => this.setState({ questionImage: null })}>
                                        Remove image
                                    </Button>
                                </div>
                            )}
                        </Form.Group>
                        <Form.Group controlId="answers">
                            <h4>Answers</h4>
                            {answers.map((answer, index) => (
                                <div key={index} className="mb-4 border-bottom border-dark">
                                    <div className="input-group mb-2">
                                        <div className="input-group-prepend">
                                            <div className="input-group-text">
                                                <input
                                                    type="checkbox"
                                                    checked={answer.correct}
                                                    onChange={() => this.handleCheckboxChange(index)}
                                                />
                                            </div>
                                        </div>
                                        <Form.Control
                                            type="text"
                                            placeholder={`Enter answer ${index + 1}`}
                                            value={answer.text}
                                            onChange={(e) => {
                                                const updatedAnswers = [...answers];
                                                updatedAnswers[index].text = e.target.value;
                                                this.setState({ answers: updatedAnswers });
                                            }}
                                        />
                                        <Button variant="danger" className="ml-2" onClick={() => this.handleRemoveAnswer(index)}>
                                            Remove
                                        </Button>
                                    </div>
                                    {!answer.image ? (
                                        <div className="custom-file mb-2">
                                            <input
                                                type="file"
                                                className="custom-file-input"
                                                id={`customFile${index}`}
                                                onChange={(e) => this.handleImageChange("answers", index, e)}
                                            />
                                            <label className="custom-file-label" htmlFor={`customFile${index}`}>
                                                {answer.image ? answer.image.name : "Add image"}
                                            </label>
                                        </div>
                                    ) : (
                                        <div className="text-center mb-2">
                                            <div>
                                                <img
                                                    src={answer.imagePreview}
                                                    className="quiz-image"
                                                    alt="answer image"
                                                />
                                            </div>
                                            <Button className="btn-sm" variant="danger" onClick={() => this.handleRemoveImage(index)}>
                                                Remove image
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            ))}
                            <div className="mb-2">
                                <Button className="btn-block" variant="success" onClick={this.handleAddAnswer}>
                                    Add Answer
                                </Button>
                            </div>
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="primary" onClick={this.handleCreateQuestion}>
                        Create Question
                    </Button>
                    <Button variant="danger" onClick={this.handleClose}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>
        );
    }
}

export default CreateQuestionModal;