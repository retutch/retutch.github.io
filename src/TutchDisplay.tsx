import React from 'react';
import { TutchResponse } from './types';

function TutchDisplay(params: { tutchResponse: TutchResponse }) {
  const { tutchResponse } = params;

  const stateStyle: React.CSSProperties = {
    flex: '0 0 40px',
    display: 'flex',
    justifyContent: 'center',
    alignContent: 'center',
  };
  const stateDisplay =
    tutchResponse.state === 'Waiting' ? (
      <div style={{ ...stateStyle, background: 'rgba(0,0,0,.2' }}>
        <p>Waiting...</p>
      </div>
    ) : tutchResponse.state === 'ExpectedError' ? (
      <div style={{ ...stateStyle, background: 'rgba(204, 153, 0, .2)' }}>
        <p>Syntax error</p>
      </div>
    ) : tutchResponse.state === 'UnexpectedError' ? (
      <div style={{ ...stateStyle, background: 'rgba(204, 153, 0, .2)' }}>
        <p>Unexpected error!</p>
      </div>
    ) : tutchResponse.justifications.some((value) => value.type === 'NotJustified') ? (
      <div style={{ ...stateStyle, background: 'rgba(204, 0, 0, .2)' }}>
        <p>Some unjustified inferences</p>
      </div>
    ) : (
      <div style={{ ...stateStyle, background: 'rgba(0, 0, 204, .2)' }}>
        <p>All inferences justified</p>
      </div>
    );

  const displayContents =
    tutchResponse.state === 'Waiting' ? (
      <p>...</p>
    ) : tutchResponse.state === 'ExpectedError' ? (
      <p>
        {tutchResponse.contents.message} on line {tutchResponse.contents.loc?.start.line}
      </p>
    ) : tutchResponse.state === 'UnexpectedError' ? (
      <p>{tutchResponse.msg}</p>
    ) : (
      <ul>
        {tutchResponse.justifications
          .sort((a, b) =>
            a.loc.start.line === b.loc.start.line
              ? a.loc.start.column - b.loc.start.column
              : a.loc.start.line - b.loc.start.line,
          )
          .map((just, i) => {
            if (just.type === 'NotJustified') {
              return <li key={i}>Line {just.loc.start.line}: Not justified</li>;
            }
            if (!just.rule) {
              return <li key={i}>Line {just.loc.start.line}: Justified proof</li>;
            }
            return (
              <li key={i}>
                Line {just.loc.start.line}: Justified by {just.rule}
              </li>
            );
          })}
      </ul>
    );

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column' }}>
      {stateDisplay}
      <div style={{ overflowX: 'scroll', overflowY: 'scroll' }}>{displayContents}</div>
    </div>
  );
}

export default TutchDisplay;
