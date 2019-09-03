import React from "react";
import styled, {keyframes, css} from "styled-components";
import Spinner from "../icons/Spinner";

const spin = keyframes`
  from {
    transform: rotate(0deg);
  }
  
  to {
    transform: rotate(360deg);
  }
`;

const LoadingIndicator = styled.div`
  background: white;
  border-radius: 50%;
  padding: 0.75rem;
  box-shadow: 2px 2px 10px 0 rgba(0, 0, 0, 0.2);
  color: white;
  width: 3.7rem;
  height: 3.7rem;

  ${({inline}) =>
    inline
      ? css`
          width: 0.75rem;
          height: 0.75rem;
          padding: 0;
          background: transparent;
          box-shadow: none;
          position: relative;
          display: inline-block;
        `
      : ""};

  svg {
    display: block;
    animation: ${spin} 1.5s linear infinite;

    ${({inline}) =>
      inline
        ? css`
            position: absolute;
            top: -50%;
            left: -120%;
          `
        : ""};
  }
`;

const LoadingSafeDivComponent = ({loading, ...props}) => <div {...props} />;

const LoadingContainer = styled(LoadingSafeDivComponent)`
  position: absolute;
  top: 1rem;
  left: 0;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  opacity: 0;
  pointer-events: none;
  user-select: none;
  transition: opacity 0.1s ease-out, transform 0.2s ease-out;
  transform: translateY(-5rem);
  z-index: 10;

  ${({loading = false}) =>
    loading
      ? css`
          opacity: 1;
          pointer-events: all;
          transform: translateY(0);
        `
      : ""};
`;

const Loading = ({className, inline, size}) => {
  const defaultSize = inline ? 24 : 35;

  return (
    <LoadingIndicator data-testid="loading" inline={inline} className={className}>
      <Spinner width={size || defaultSize} height={size || defaultSize} />
    </LoadingIndicator>
  );
};

export default Loading;

export const LoadingDisplay = ({loading = false, className, inline, size}) => (
  <LoadingContainer
    data-testid="loading-container"
    className={className}
    loading={loading}>
    <Loading inline={inline} size={size} />
  </LoadingContainer>
);
