import React, {useState, useCallback, useEffect} from "react";
import gql from "graphql-tag";
import {useMutation, useApolloClient} from "@apollo/react-hooks";
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
  transition-duration: 0.1s;
  margin: 0 40px -2px 25px;
  min-width: max-content;
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

const SuccessContent = styled.div`
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: space-evenly;
`;

const SuccessMsg = styled.div`
  font-size: 1rem;
`;

const InfoRow = styled.div`
  display: flex;
  margin: 0 0 17px 0;
  font-size: 0.8rem;
  align-items: center;
  width: 100%;
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

const InputImageRow = ({imageName, removeImage, sending}) => {
  return (
    <StyledInputImage>
      <div>{imageName}</div>
      {!sending && (
        <RemoveImageIconWrapper onClick={removeImage}>
          <RemoveImageIcon viewBox="0 0 30 30">
            <polyline points="0 0 30 30" />
            <polyline points="0 30 30 0" />
          </RemoveImageIcon>
        </RemoveImageIconWrapper>
      )}
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
  font-size: 1rem;
  font-weight: 500;
  appearance: none;
  outline: none;
  border-radius: 2.5rem;
  border: 1px solid var(--blue);
  background: white;
  letter-spacing: -0.6px;
  padding: 0 1.65em;
  color: var(--blue);
  user-select: none;
  display: flex;
  align-items: center;
  justify-content: center;
  width: auto;
  flex: 0 0 auto;
  height: 2.5rem;
  cursor: pointer;
  transform: scale(1) translateZ(0);
  transition: background-color 0.2s ease-out, transform 0.1s ease-out;
  &:hover {
    background: #eeeeee;
    transform: scale(1.025);
  }
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

const ErrorMsg = styled.div`
  color: white;
  border-radius: 15px;
  padding: 0.5rem 1rem;
  margin: 1.5rem 0 0 0;
  background: #ff000080;
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
    feedbackImageFileNames,
    showFeedbackSuccessMsg,
    showFeedbackError,
    showFeedbackImageError,
  } = state;

  const SEND_FEEDBACK_MUTATION = gql`
    mutation sendFeedback($text: String!, $email: String!, $url: String!) {
      sendFeedback(text: $text, email: $email, url: $url) {
        text
        email
        msgTs
      }
    }
  `;

  const UPLOAD_IMAGE_MUTATION = gql`
    mutation uploadFeedbackImage($file: Upload!, $msgTs: String) {
      uploadFeedbackImage(file: $file, msgTs: $msgTs) {
        filename
        mimetype
        encoding
      }
    }
  `;

  const [shareUrl, setShareUrl] = useState("");
  const [uploadImageMutation] = useMutation(UPLOAD_IMAGE_MUTATION);
  const [sendFeedbackMutation] = useMutation(SEND_FEEDBACK_MUTATION);
  const apolloClient = useApolloClient();

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

  const onSend = async () => {
    Feedback.setSendingState(true);
    let success = true;
    let msgTs;
    // send text content of the feedback
    try {
      const feedbackRes = await sendFeedbackMutation({
        variables: {text: feedbackContent, email: feedbackEmail, url: shareUrl},
      });
      console.log("feedback response", feedbackRes);
      msgTs = feedbackRes.data.sendFeedback.msgTs;
    } catch (e) {
      console.log(e);
      success = false;
      Feedback.showFeedbackError();
    }
    if (success && msgTs) {
      // send images of the feedback
      try {
        const files = feedbackImageFileNames.map((fileName) =>
          feedbackImageFiles.get(fileName)
        );
        const uploadRes = await Promise.all(
          files.map((file) => uploadImageMutation({variables: {file, msgTs}}))
        );
        console.log("image upload response", uploadRes);
      } catch (e) {
        console.log(e);
        success = false;
        Feedback.showFeedbackImageError();
      }
    }
    apolloClient.resetStore();
    Feedback.setSendingState(false);
    if (success) {
      Feedback.resetFeedback();
      Feedback.showFeedbackSuccessMsg();
    }
  };

  const closeModal = () => {
    onClose();
    Feedback.resetErrorAndSuccessMsg();
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

  if (showFeedbackSuccessMsg)
    return (
      <StyledFeedbackModal isOpen={feedbackModalOpen} onEscapeKeydown={closeModal}>
        <SuccessContent>
          <SuccessMsg>{text("feedback.success.msg")}</SuccessMsg>
          <HideButton onClick={closeModal}>{text("general.close")}</HideButton>
        </SuccessContent>
      </StyledFeedbackModal>
    );

  return (
    <StyledFeedbackModal isOpen={feedbackModalOpen} onEscapeKeydown={closeModal}>
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
        {feedbackImageFileNames.length > 0 && (
          <div>
            <div>Images to upload:</div>
            <StyledInputImageList>
              {feedbackImageFileNames.map((imageName) => (
                <InputImageRow
                  key={imageName}
                  imageName={imageName}
                  sending={feedbackSending}
                  removeImage={() => Feedback.removeImageFile(imageName)}
                />
              ))}
            </StyledInputImageList>
          </div>
        )}
        {!feedbackSending && (
          <AddImagesRow>
            <StyledImageInputButton>
              {text("feedback.upload.image")}
              <HiddenFileInput
                multiple
                type="file"
                id="feedbackFiles"
                name="feedbackFiles"
                accept="image/*"
                onChange={handleImageInputChange}
              />
            </StyledImageInputButton>
          </AddImagesRow>
        )}
        <ButtonRow>
          <SendButtonWrapper>
            <SendButton
              disabled={feedbackContent === "" || feedbackSending}
              primary
              onClick={() => onSend()}>
              {feedbackSending ? text("general.sending") : text("general.send")}
            </SendButton>
            {feedbackSending && <SendingSpinner inline={true} />}
          </SendButtonWrapper>
          <HideButton onClick={closeModal}>{text("general.hide")}</HideButton>
        </ButtonRow>
        {(showFeedbackError || showFeedbackImageError) && (
          <ErrorMsg>
            {showFeedbackError
              ? text("feedback.error.general")
              : text("feedback.error.images")}
          </ErrorMsg>
        )}
      </ModalContent>
    </StyledFeedbackModal>
  );
});

export default FeedbackModal;
