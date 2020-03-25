import Dropzone from 'dropzone';
import { findOne, addClass } from 'domassist';
Dropzone.autoDiscover = false;

const form = findOne('#upload');
new Dropzone(form, {
  method: 'post',
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

    const { signature } = await resp.json();

    file.custom_status = 'ready';
    file.postData = signature.fields;
    file.contentType = signature.contentType;
    file.s3Url = `${signature.url}/${signature.fields.key}`;
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
  complete: file => {
    // eslint-disable-next-line no-console
    console.log('UPLOADED', file.s3Url);
  }
});
