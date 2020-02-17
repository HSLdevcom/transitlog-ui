import React, {useState, useCallback, useEffect} from "react";
import StyledModal from "styled-react-modal";
import styled from "styled-components";
import {Button} from "./Forms";
import copy from "copy-text-to-clipboard";
import {observer} from "mobx-react-lite";
import flow from "lodash/flow";
import {inject} from "../helpers/inject";
import Checkmark from "../icons/Checkmark";

const ShareModal = StyledModal.styled`
  width: 40vw;
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

const UrlDisplay = styled.textarea`
  background: white;
  font-family: inherit;
  box-shadow: inset 2px 2px 5px 0 rgba(0, 0, 0, 0.1);
  padding: 0.5rem;
  line-height: 1.5;
  font-size: 1rem;
  margin-bottom: 1rem;
`;

const ModalContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  width: 100%;
  position: relative;
`;

const CopyButton = styled(Button)`
  background: ${({copied = false}) => (copied ? "var(--light-green)" : "var(--blue)")};
  border: 0;

  svg {
    margin-right: 0.5rem;
    margin-left: -0.5rem;
  }
`;

const DoneButton = styled(Button)``;

const ButtonRow = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const excludeAuthenticationParams = (urlToShare) => {
  const url = new URL(urlToShare);
  url.searchParams.delete("code");
  url.searchParams.delete("scope");
  return url.href;
};

const decorate = flow(observer, inject("state"));

const SharingModal = decorate((props) => {
  const {state, onClose} = props;
  const {shareModalOpen} = state;

  const [copied, setCopied] = useState("");
  const [shareUrl, setShareUrl] = useState("");

  const onCopy = useCallback((url) => {
    copy(url);
    setCopied(url);
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
    if (shareModalOpen) {
      createShareUrl();
    }
  }, [shareModalOpen]);

  return (
    <ShareModal
      isOpen={shareModalOpen}
      onBackgroundClick={onClose}
      onEscapeKeydown={onClose}>
      <ModalContent>
        <UrlDisplay
          data-testid="share-url-display"
          resizeable={false}
          rows={4}
          value={shareUrl}
          disabled={true}
        />
        <ButtonRow>
          <CopyButton
            copied={copied === shareUrl}
            primary
            onClick={() => onCopy(shareUrl)}>
            {copied === shareUrl && (
              <Checkmark width="1.5rem" height="1.5rem" fill="white" />
            )}{" "}
            {copied === shareUrl ? "Copied!" : "Copy"}
          </CopyButton>
          <DoneButton onClick={onClose}>Done</DoneButton>
        </ButtonRow>
      </ModalContent>
    </ShareModal>
  );
});

export default SharingModal;
