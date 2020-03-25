import React, {useState, useCallback, useEffect} from "react";
import StyledModal from "styled-react-modal";
import styled, {css} from "styled-components";
import {Button} from "./Forms";
import {observer} from "mobx-react-lite";
import flow from "lodash/flow";
import {inject} from "../helpers/inject";
import {text} from "../helpers/text";
import Loading from "./Loading";

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

const StyledInputImageList = styled.div`
  margin: 10px 0 20px 0;
`;
const StyledInputImage = styled.div`
  font-size: 0.8rem;
  display: flex;
  width: max-content;
  justify-content: space-between;
  border-radius: 20px;
  color: white;
  padding: 5px 9px;
  margin: 5px 0px;
  background-color: var(--blue);
`;
const RemoveImageIconWrapper = styled.div`
  display: inline-block;
  vertical-align: middle;
  cursor: pointer;
`;
const RemoveImageIcon = styled.svg`
  width: 10px;
  height: 10px;
  margin: 0 1px -1px 10px;
  fill: none;
  stroke: white;
  stroke-width: 6px;
`;

const InputImageRow = ({imageFile, removeImage}) => {
  return (
    <StyledInputImage>
      <div>{imageFile}</div>
      <RemoveImageIconWrapper onClick={removeImage}>
        <RemoveImageIcon viewBox="0 0 30 30">
          <polyline points="0 0 30 30" />
          <polyline points="0 30 30 0" />
        </RemoveImageIcon>
      </RemoveImageIconWrapper>
    </StyledInputImage>
  );
};

const AddImagesRow = styled.div`
  display: inline-block;
  vertical-align: middle;
  margin: 0 0 20px 0;
`;
const HiddenFileInput = styled.input.attrs({type: "file"})`
  width: 0.1px;
  height: 0.1px;
  opacity: 0;
  overflow: hidden;
  position: absolute;
  z-index: -1;
`;
const StyledImageInputButton = styled.label`
  font-family: var(--font-family);
  font-size: ${({small = false}) => (small ? "0.75rem" : "1rem")};
  font-weight: 500;
  appearance: none;
  outline: none;
  border-radius: 2.5rem;
  border: 1px solid ${({transparent = false}) => (!transparent ? "var(--blue)" : "white")};
  background: ${({primary = false, transparent = false}) =>
    primary ? "var(--blue)" : transparent ? "transparent" : "white"};
  letter-spacing: -0.6px;
  padding: 0 ${({small = false}) => (small ? "1.25rem" : "1.65em")};
  color: ${({primary = false, transparent = false}) =>
    primary || transparent ? "white" : "var(--blue)"};
  user-select: none;
  display: flex;
  align-items: center;
  justify-content: center;
  width: auto;
  flex: 0 0 auto;
  height: ${({small = false}) => (small ? "1.75rem" : "2.5rem")};
  cursor: pointer;
  transform: scale(1) translateZ(0);
  transition: background-color 0.2s ease-out, transform 0.1s ease-out;

  &:hover {
    background: ${({primary = false, transparent}) =>
      primary || transparent ? "var(--dark-blue)" : "#eeeeee"};
    transform: scale(1.025);
  }
`;

const InfoRow = styled.div`
  display: flex;
  margin: 0 0 17px 0;
  font-size: 0.8rem;
  align-items: center;
  width: 100%;
`;

const ButtonRow = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const SendButtonWrapper = styled.div`
  display: flex;
  align-items: center;
`;

const SendButton = styled(Button)`
  background: var(--blue);
  border: 0;

  svg {
    margin-right: 0.5rem;
    margin-left: -0.5rem;
  }
  ${(props) =>
    props.disabled == true &&
    css`
      background: var(--light-grey);
      &:hover {
        cursor: unset;
        background: var(--light-grey);
        transform: unset;
      }
    `}
`;
const SendingSpinner = styled(Loading)`
  margin: 0.5rem 0.5rem 0.5rem 2rem;
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
  const {
    feedbackModalOpen,
    feedbackSending,
    feedbackContent,
    feedbackEmail,
    feedbackImageFiles,
  } = state;

  const [shareUrl, setShareUrl] = useState("");

  const handleContentChange = (event) => {
    Feedback.setContent(event.target.value);
  };

  const handleEmailChange = (event) => {
    Feedback.setEmail(event.target.value);
  };

  const handleImageInputChange = (event) => {
    Feedback.addImageFiles(event.target.files);
    document.getElementById("feedbackFiles").value = "";
  };

  const onSend = async (feedbackContent, feedbackEmail, feedbackImages, url) => {
    const slackWebhook = process.env.REACT_APP_SLACK_FEEDBACK_URL;
    // console.log("slackWebhook", slackWebhook);

    Feedback.startSending();

    const feedbackText =
      "*" + feedbackEmail.trim() + "*\n\n" + feedbackContent.trim() + "\n\n" + url;
    const data = {
      type: "mrkdwn",
      text: feedbackText,
    };

    console.log("sending feedback", JSON.stringify(data));

    // await new Promise((resolve) => setTimeout(resolve, 3000));

    const response = await fetch(slackWebhook, {
      method: "POST",
      body: JSON.stringify(data),
    });

    // const response = {status: 200};

    console.log("response", response);

    Feedback.sentFeedback(response);
  };

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
        <InfoRow>{text("feedback.includes.url")}</InfoRow>
        <FeedbackTextArea
          placeholder={text("feedback.placeholder")}
          value={feedbackContent}
          onChange={handleContentChange}
          data-testid="feedback-display"
          resizeable={true}
          rows={5}
          disabled={feedbackSending}
        />
        <FeedbackEmailInput
          placeholder={text("general.email")}
          value={feedbackEmail}
          onChange={handleEmailChange}
          disabled={feedbackSending}
        />
        {feedbackImageFiles.length > 0 && (
          <div>
            <div>Images to upload:</div>
            <StyledInputImageList>
              {feedbackImageFiles.map((imageFile) => (
                <InputImageRow
                  key={imageFile.name}
                  imageFile={imageFile.name}
                  removeImage={() => Feedback.removeImageFile(imageFile.name)}
                />
              ))}
            </StyledInputImageList>
          </div>
        )}
        <AddImagesRow>
          <StyledImageInputButton>
            {text("feedback.upload.image")}
            <HiddenFileInput
              multiple
              type="file"
              id="feedbackFiles"
              name="feedbackFiles"
              onChange={handleImageInputChange}
            />
          </StyledImageInputButton>
        </AddImagesRow>
        <ButtonRow>
          <SendButtonWrapper>
            <SendButton
              disabled={feedbackContent === "" || feedbackSending}
              primary
              onClick={() =>
                onSend(feedbackContent, feedbackEmail, feedbackImageFiles, shareUrl)
              }>
              {feedbackSending ? text("general.sending") : text("general.send")}
            </SendButton>
            {feedbackSending && <SendingSpinner inline={true} />}
          </SendButtonWrapper>
          <HideButton onClick={onClose}>{text("general.hide")}</HideButton>
        </ButtonRow>
      </ModalContent>
    </StyledFeedbackModal>
  );
});

export default FeedbackModal;
