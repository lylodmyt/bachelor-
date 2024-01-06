import React, { Component } from "react";
import { Modal, Form, Button, Alert } from "react-bootstrap";
import axios from "axios";
import AuthService from "../../services/auth-service";
import { ANSWER_API_URL, IMAGE_API_URL, QUESTION_API_URL } from "../../helpers/paths";

class EditQuestionModal extends Component {
    constructor(props) {
        super(props);

        this.initialState = {
            questionTextOld: "",
            answersOld: [],
            questionTextNew: "",
            answersNew: [],
            errorMessage: "",
        };

        this.state = { ...this.initialState };
    }

    componentDidUpdate(prevProps) {
        if (this.props.questionId !== prevProps.questionId) {
            if (this.props.questionId !== null){
                this.fetchQuestion();
            }
        }
    }

    fetchQuestion() {
        axios
            .get(QUESTION_API_URL + "get/" + this.props.questionId, {
                headers: {
                    Authorization: `Bearer ${AuthService.getCurrentUser().token}`,
                },
            })
            .then(({ data: question }) => {
                console.log(question);
                this.setState({
                    questionTextOld: question.title,
                    questionTextNew: question.title,
                    answersOld: question.answers.map(this.mapAnswer),
                    answersNew: question.answers.map(this.mapAnswer),
                });
            })
            .catch((error) => {
                console.error("Error fetching question:", error);
            });
    }

    mapAnswer = (answer) => ({
        id: answer.id,
        text: answer.text,
        correct: answer.correct,
    });

    handleClose = () => {
        this.props.handleClose();
    };

    handleAddAnswer = () => {
        this.setState((prevState) => ({
            answersNew: [...prevState.answersNew, { text: "", correct: false, image: null }],
        }));
    };

    handleRemoveAnswer = (index) => {
        this.setState((prevState) => {
            const updatedAnswers = [...prevState.answersNew];
            updatedAnswers.splice(index, 1);
            return { answersNew: updatedAnswers };
        });
    };

    handleCheckboxChange = (index) => {
        const { answersNew } = this.state;
        const updatedAnswers = [...answersNew];
        updatedAnswers[index].correct = !updatedAnswers[index].correct;
        this.setState({ answersNew: updatedAnswers });
    };

    handleUpdateQuestion = async () => {
        const {
            questionTextOld,
            answersOld,
            questionTextNew,
            answersNew,
        } = this.state;
        if (!questionTextNew) {
            this.setState({ errorMessage: "Question must not be empty." });
            return;
        } else if (answersNew.length < 2) {
            this.setState({ errorMessage: "There must be at least 2 answers." });
            return;
        } else if (answersNew.filter((answer) => answer.correct).length === 0) {
            this.setState({ errorMessage: "There must be at least 1 correct answer." });
            return;
        } else if (answersNew.some((answer) => !answer.text)) {
            this.setState({ errorMessage: "Answer text must not be empty." });
            return;
        }
        const deletedAnswers = answersOld.filter((answer) => !answersNew.some((newAnswer) => newAnswer.id === answer.id));
        if (deletedAnswers.length > 0) {
            deletedAnswers.forEach((answer) => {
                axios.delete(ANSWER_API_URL + "delete/" + answer.id, {
                    headers: {
                        Authorization: `Bearer ${AuthService.getCurrentUser().token}`,
                    },
                }).catch((error) => {
                    console.error("Error deleting answer:", error);
                });
            });
        }
        const addedAnswers = answersNew.filter((answer) => !answersOld.some((oldAnswer) => oldAnswer.id === answer.id));
        if (addedAnswers.length > 0) {
            const answerDtos = addedAnswers.map((answer) => ({
                text: answer.text,
                correct: answer.correct,
                questionId: this.props.questionId,
            }));

            const answersResponse = await axios.post(
                ANSWER_API_URL + `addAnswers/${this.props.questionId}`,
                answerDtos,
                {
                    headers: {
                        Authorization: `Bearer ${AuthService.getCurrentUser().token}`,
                    },
                }
            );
            for (let i = 0; i < answersResponse.data.length; i++) {
                const answer = answersResponse.data[i];
                if (addedAnswers[i].image) {
                    const formData = new FormData();
                    formData.append("image", addedAnswers[i].image);
                    await axios.post(IMAGE_API_URL + `answer/${answer.id}`, formData, {
                        headers: {
                            Authorization: `Bearer ${AuthService.getCurrentUser().token}`,
                        },
                    });
                }
            }
        }
        const changedAnswers = answersNew.filter((answer) => answersOld.some((oldAnswer) => oldAnswer.id === answer.id));
        if (changedAnswers.length > 0) {
            const answerDtos = changedAnswers.map((answer) => ({
                id: answer.id,
                text: answer.text,
                correct: answer.correct,
                questionId: this.props.questionId,
            }));

            for (let i = 0; i < answerDtos.length; i++) {
                await axios.put(ANSWER_API_URL + "update", answerDtos[i], {
                    headers: {
                        Authorization: `Bearer ${AuthService.getCurrentUser().token}`,
                    },
                });
            }
        }
        if (questionTextOld !== questionTextNew) {
            const questionDto = {
                id: this.props.questionId,
                title: questionTextNew,
                topicId: this.props.topicId,
            };
            await axios.put(QUESTION_API_URL + "update", questionDto, {
                headers: {
                    Authorization: `Bearer ${AuthService.getCurrentUser().token}`,
                },
            });
        }
        this.setState({ ...this.initialState });
        this.handleClose();
    };


    render() {
        const { show } = this.props;
        const {
            questionTextNew,
            answersNew,
            errorMessage,
        } = this.state;
        return (
            <Modal show={show}>
                <Modal.Header>
                    <Modal.Title>Edit Question</Modal.Title>
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
                                value={questionTextNew}
                                onChange={(e) => this.setState({ questionTextNew: e.target.value })}
                            />
                        </Form.Group>
                        <Form.Group controlId="answers">
                            <h4>Answers</h4>
                            {answersNew.map((answer, index) => (
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
                                                const updatedAnswers = [...answersNew];
                                                updatedAnswers[index].text = e.target.value;
                                                this.setState({ answersNew: updatedAnswers });
                                            }}
                                        />
                                        <Button variant="danger" className="ml-2" onClick={() => this.handleRemoveAnswer(index)}>
                                            Remove
                                        </Button>
                                    </div>
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
                    <Button variant="primary" onClick={this.handleUpdateQuestion}>
                        Update Question
                    </Button>
                    <Button variant="danger" onClick={this.handleClose}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>
        );
    }
}

export default EditQuestionModal;