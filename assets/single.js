/* eslint-env browser */
import Dropzone from 'dropzone';
import { addClass, findOne, on, show, hide, styles } from 'domassist';

const opts = window.uploaderSetup;

const sendMessage = function(event) {
  if (!window.parent) {
    return;
  }
  window.parent.postMessage(JSON.stringify(event), '*');
};

let dropzone;

const isImageFile = function(imgSrc) {
  return (/\.(gif|jpg|jpeg|tiff|png|svg)$/i).test(imgSrc);
};

const handleImage = function(imgSrc) {
  hide(['#uploader', '#progress', '#status']);

  if (isImageFile(imgSrc)) {
    styles('#results', {
      backgroundImage: `url(${imgSrc})`,
      display: 'block'
    });
  } else {
    styles('#results', { display: 'block' });
    addClass('#results', 'default-image');
  }

  show('#clear');
};

Dropzone.options.uploader = {
  init() {
    dropzone = this;
    if (opts.defaultImage) {
      handleImage(opts.defaultImage);
    }
  },
  uploadMultiple: false,
  maxFiles: 1,
  uploadprogress(file, progress) {
    hide('#uploader');
    show(['#progress', '#status']);
    if (progress > 97) {
      findOne('#status').innerHTML = 'Uploading...';
    }
    styles('#progress .bar', {
      width: `${progress}%`
    });
  },
  accept: async (file, done) => {
    file.postData = [];

    // eslint-disable-next-line no-undef
    const resp = await fetch('signature', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      redirect: 'follow',
      body: JSON.stringify({
        filename: file.name
      })
    });

    if (resp.status !== 200) {
      return done('Error uploading file');
    }

    const { signature, mediaUrl } = await resp.json();

    file.custom_status = 'ready';
    file.postData = signature.fields;
    file.contentType = signature.contentType;
    file.s3Url = mediaUrl;
    addClass(file.previewTemplate, 'uploading');
    done();
  },
  sending: (file, xhr, formData) => {
    Object.keys(file.postData).forEach(key => {
      formData.append(key, file.postData[key]);
    });
    formData.append('acl', 'public-read');
    formData.append('success_action_status', '200');
    formData.append('content-type', file.contentType);
  },
  error(file, error) {
    findOne('#status').innerHTML = error.message || 'There was an error.';
    event.type = 'error';
    event.data = error;

    show('#clear');
    return sendMessage(event);
  },
  success(file) {
    const event = {};

    const imageUrl = file.s3Url;
    handleImage(imageUrl);

    event.type = 'complete';
    event.data = {
      location: imageUrl
    };

    if (opts.inputId) {
      event.inputId = opts.inputId;
    }
    sendMessage(event);
  },
  dictDefaultMessage: `${window.uploaderSetup.defaultText}<small class="message-notice">${window.uploaderSetup.noticeText}</small>`
};

on('#clear', 'click', () => {
  dropzone.removeAllFiles();
  show('#uploader');
  hide(['#results', '#clear']);
  const event = {
    type: 'clear'
  };
  sendMessage(event);
});
