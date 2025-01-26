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

const ShareButton = ({ url, title }: { url: string, title: string }) => {
  return (
    <div className="flex space-x-2 p-3">
      <FacebookShareButton url={url} title={title}>
        <FacebookIcon size={32} round />
      </FacebookShareButton>
      <TwitterShareButton url={url} title={title}>
        <XIcon size={32} round />
      </TwitterShareButton>
      <LinkedinShareButton url={url} title={title}>
        <LinkedinIcon size={32} round />
      </LinkedinShareButton>
      <WhatsappShareButton url={url} title={title}>
        <WhatsappIcon size={32} round />
      </WhatsappShareButton>
      <TelegramShareButton url={url} title={title}>
        <TelegramIcon size={32} round />
      </TelegramShareButton>
    </div>
  );
};

export default ShareButton;
