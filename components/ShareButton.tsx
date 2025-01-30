// components/ShareButton.js
import React from 'react';
import {
  FacebookShareButton,
  TwitterShareButton,
  LinkedinShareButton,
  WhatsappShareButton,
  FacebookIcon,
  XIcon,
  LinkedinIcon,
  WhatsappIcon,
  TelegramShareButton,
  TelegramIcon,

} from 'react-share';

const ShareButton = ({ url }: { url: string }) => {
  return (
    <div className="flex space-x-2 p-3">
      <FacebookShareButton url={url} >
        <FacebookIcon size={32} round />
      </FacebookShareButton>
      <TwitterShareButton url={url} >
        <XIcon size={32} round />
      </TwitterShareButton>
      <LinkedinShareButton url={url} >
        <LinkedinIcon size={32} round />
      </LinkedinShareButton>
      <WhatsappShareButton url={url} >
        <WhatsappIcon size={32} round />
      </WhatsappShareButton>
      <TelegramShareButton url={url} >
        <TelegramIcon size={32} round />
      </TelegramShareButton>
    </div>
  );
};

export default ShareButton;
