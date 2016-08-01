/* eslint-disable no-throw-literal */
import moment from 'moment';
import fetch from 'node-fetch';
import {TO_EMAILS, FROM_EMAIL, FROM_NAME, SPARKPOST_KEY} from './env';

const isToday = (timestamp) => {
  if (!timestamp) {
    return false;
  }
  const today = moment().format('YYYYMMDD');
  const time = moment(timestamp).format('YYYYMMDD');
  return (time === today);
};

const hasTimeSpent = (issue) => {
  const timeRegex = /timespent:\s+(\d+)h|(\d+\.5)h/gi;
  const match = timeRegex.exec(issue.description);
  if (match) {
    issue.timeSpent = match[1];
    return issue;
  }
  return issue;
};

const sendEmail = (subject, html) => {
  const url = 'https://api.sparkpost.com/api/v1/transmissions';
  const toEmails = JSON.parse(TO_EMAILS);
  const recipients = toEmails.map(e => ({address: {email: e, header_to: toEmails.join(',')}}));
  const content = {
    html,
    subject,
    from: {
      name: FROM_NAME,
      email: FROM_EMAIL
    },
    reply_to: FROM_EMAIL
  };

  console.log('Sending email...');
  fetch(url, {
    method: 'POST',
    body: JSON.stringify({recipients, content}),
    headers: {
      'Content-Type': 'application/json',
      Authorization: SPARKPOST_KEY
    }}).then(
      (response) => {
        if (response.status >= 200 && response.status < 300) {
          console.log('Email sent succesfully');
          response.text().then((d) => (console.log(d)));
        } else {
          console.error('Email sending error');
          response.text().then((d) => (console.error(d)));
        }
      },
      (e) => {
        console.log(e);
      });
};

export {isToday, sendEmail, hasTimeSpent};
