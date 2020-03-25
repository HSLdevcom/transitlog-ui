import React, {useState, useCallback, useEffect} from "react";
import StyledModal from "styled-react-modal";
import styled from "styled-components";
import {Button} from "./Forms";
import {observer} from "mobx-react-lite";
import flow from "lodash/flow";
import {inject} from "../helpers/inject";
import {text} from "../helpers/text";

const StyledToggleFeedbackButton = styled.div`
  color: white;
  border-bottom: 2px solid transparent;
  margin-bottom: -2px;
  transition-duration: 0.1s;
  &:hover {
    cursor: pointer;
    border-bottom: 2px solid rgba(255, 255, 255, 0.94);
  }
`;

export const ToggleFeedbackButton = ({handleClick}) => {
  return (
    <StyledToggleFeedbackButton onClick={handleClick}>
      {text("feedback.give")}
    </StyledToggleFeedbackButton>
  );
};

const StyledFeedbackModal = StyledModal.styled`
  width: 40vw;
  margin-left: 20%;
  min-width: 20rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--lightest-grey);
  box-shadow: 0 0 20px 0 rgba(0,0,0,0.25);
  border-radius: 5px;
  border: 1px solid var(--blue);
  padding: 1.5rem;
`;

const ModalContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  width: 100%;
  position: relative;
`;

const FeedbackTextArea = styled.textarea`
  background: white;
  font-family: inherit;
  border-radius: 0.25rem;
  border: 1px solid var(--alt-grey);
  box-shadow: inset 2px 2px 5px 0 rgba(0, 0, 0, 0.1);
  outline: none;
  padding: 0.5rem;
  resize: vertical;
  line-height: 1.5;
  font-size: 1rem;
  margin-bottom: 1rem;
  &:focus {
    border-color: var(--blue);
    box-shadow: inset 2px 2px 2px 0 rgba(0, 122, 201, 0.1);
  }
  ::placeholder,
  ::-webkit-input-placeholder {
    color: #878a8a;
  }
`;

const FeedbackEmailInput = styled.input`
  font-family: var(--font-family);
  padding: 0.25rem 0.7rem;
  type: email;
  border-radius: 0.25rem;
  border: 1px solid var(--alt-grey);
  box-shadow: inset 2px 2px 5px 0 rgba(0, 0, 0, 0.1);
  outline: none;
  font-size: 1rem;
  height: 2.5rem;
  background-color: white;
  margin: 0 0 15px 0;
  &:focus {
    border-color: var(--blue);
    box-shadow: inset 2px 2px 2px 0 rgba(0, 122, 201, 0.1);
  }
  ::placeholder,
  ::-webkit-input-placeholder {
    color: #878a8a;
  }
`;

const InfoRow = styled.div`
  display: flex;
  margin: 0 0 17px 0;
  font-size: 0.75rem;
  align-items: center;
  width: 100%;
`;

const ButtonRow = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const SendButton = styled(Button)`
  background: var(--blue);
  border: 0;

  svg {
    margin-right: 0.5rem;
    margin-left: -0.5rem;
  }
`;

const HideButton = styled(Button)``;

const excludeAuthenticationParams = (urlToShare) => {
  const url = new URL(urlToShare);
  url.searchParams.delete("code");
  url.searchParams.delete("scope");
  return url.href;
};

const decorate = flow(observer, inject("State", "Feedback", "UI"));

const FeedbackModal = decorate((props) => {
  const {state, onClose, Feedback} = props;
  const {feedbackModalOpen, feedbackContent, feedbackEmail} = state;

  const [shareUrl, setShareUrl] = useState("");

  const handleContentChange = (event) => {
    Feedback.setFeedbackContent(event.target.value);
  };

  const handleEmailChange = (event) => {
    Feedback.setFeedbackEmail(event.target.value);
  };

  const onSend = useCallback((feedbackContent, feedbackEmail, url) => {
    console.log(
      "sending feedback:",
      feedbackContent,
      "from email:",
      feedbackEmail,
      "at:",
      url
    );
  }, []);

  const createShareUrl = useCallback(() => {
    const prodOrigin = process.env.REACT_APP_PRODUCTION_URL;
    const currentOrigin = window.location.origin;

    let urlToShare = window.location.href;
    urlToShare = excludeAuthenticationParams(urlToShare);

    if (prodOrigin !== currentOrigin) {
      urlToShare = urlToShare.replace(currentOrigin, prodOrigin);
    }

    setShareUrl(urlToShare);
  }, [window.location.href]);

  useEffect(() => {
    if (feedbackModalOpen) {
      createShareUrl();
    }
  }, [feedbackModalOpen]);

  return (
    <StyledFeedbackModal isOpen={feedbackModalOpen} onEscapeKeydown={onClose}>
      <ModalContent>
        <FeedbackTextArea
          placeholder={text("feedback.placeholder")}
          value={feedbackContent}
          onChange={handleContentChange}
          data-testid="feedback-display"
          resizeable={true}
          rows={5}
        />
        <FeedbackEmailInput
          placeholder={text("general.email")}
          value={feedbackEmail}
          onChange={handleEmailChange}
        />
        <InfoRow>{text("feedback.includes.url")}</InfoRow>
        <ButtonRow>
          <SendButton
            primary
            onClick={() => onSend(feedbackContent, feedbackEmail, shareUrl)}>
            {text("general.send")}
          </SendButton>
          <HideButton onClick={onClose}>{text("general.hide")}</HideButton>
        </ButtonRow>
      </ModalContent>
    </StyledFeedbackModal>
  );
});

export default FeedbackModal;
