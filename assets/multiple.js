/* eslint-env browser */
import Dropzone from 'dropzone';
import { findOne, hide } from 'domassist';

Dropzone.options.uploader = {
  accept: async (file, done) => {
    file.postData = [];

    // eslint-disable-next-line no-undef
    const resp = await fetch('/signature', {
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

    const { signature, cdn } = await resp.json();

    file.custom_status = 'ready';
    file.postData = signature.fields;
    file.contentType = signature.contentType;
    file.s3Url = `${cdn}/${signature.fields.key}`;
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
  complete(file) {
    if (file.status !== 'success') {
      return alert('there was an error'); // eslint-disable-line no-alert
    }

    const imageUrl = file.s3Url;

    hide(findOne('#uploader'));

    const img = `
      <div class="image-container">
        <div class="image" style="background-image: url(${imageUrl});"></div>
        <input readonly value="${imageUrl}" onfocus="this.select();"/>
      </div>
    `;

    findOne('#results').insertAdjacentHTML('beforeend', img);
    if (window.parent) {
      window.parent.postMessage(imageUrl, '*');
    }
  }
};
