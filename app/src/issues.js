/* eslint-disable no-throw-literal */
import fetch from 'node-fetch';

const mkIssue = () => ({
  iid: null,
  title: null,
  milestone: null,
  createdAt: null,
  isOpen: null,
  closedAt: null,
  description: null,
  assignee: null
});

const mkFromGitlabIssue = (issue, USERS, projectName) => {
  const _i = mkIssue();

  _i.iid = issue.iid;
  _i.title = issue.title;
  _i.description = issue.description;
  _i.isOpen = !(issue.state === 'closed');
  _i.createdAt = issue.created_at;
  _i.closedAt = (!_i.isOpen) ? issue.updated_at : null; // Assumes that last update was the closing of the issue
  _i.assignee = (issue.assignee && (issue.assignee.username in USERS)) ? USERS[issue.assignee.username] : 'unassigned';
  _i.labels = issue.labels.map(l => ({name: l}));
  _i.url = 'https://gitlab.com/' + projectName + '/issues/' + _i.iid;

  return _i;
};

const mkFromGithubIssue = (issue, USERS) => {
  const _i = mkIssue();

  _i.iid = issue.number;
  _i.title = issue.title;
  _i.description = issue.body;
  _i.isOpen = (issue.state === 'open');
  _i.createdAt = issue.created_at;
  _i.closedAt = issue.closed_at;
  _i.assignee = (issue.assignee && (issue.assignee.login in USERS)) ? USERS[issue.assignee.login] : 'unassigned';
  _i.labels = issue.labels.map(l => ({name: l.name}));
  _i.url = issue.html_url;

  return _i;
};

const mkMilestone = () => ({
  url: null,
  name: null
});

const mkFromGithubMilestone = (projectName, milestone, milestoneId) => {
  const _m = mkMilestone();

  _m.url = 'https://github.com/' + projectName + '/milestone/' + milestoneId;
  _m.name = milestone;

  return _m;
};

const mkFromGitlabMilestone = (milestoneIssues, milestone, projectName) => {
  const _m = mkMilestone();

  const mi = milestoneIssues;
  _m.name = milestone;

  if (mi.length === 0 || (!mi[0].milestone)) {
    _m.url = 'https://gitlab.com/' + projectName;
    return _m;
  }

  _m.url = 'https://gitlab.com/' + projectName + '/milestones/' + mi[0].milestone.iid.toString();
  return _m;
};

const fetchFromGitlab = (projectName, milestone, gitlabToken, success) => {
  const promise = new Promise((resolve, reject) => {
    fetch(`https://gitlab.com/api/v3/projects/${projectName.replace('/', '%2F')}/issues?milestone=${milestone}`,
      {headers: {
        'Content-Type': 'application/json',
        'PRIVATE-TOKEN': `${gitlabToken}`
      }}).then(
        (response) => {
          if (response.status >= 200 && response.status < 300) {
            response.text().then((data) => {
              try {
                success(data);
                resolve();
              } catch (err) {
                console.log(err.stack);
                reject(err.toString());
              }
            });
            return;
          }
          reject(projectName + ':: ' + response.status.toString() + ': ' + response.statusText);
        },
        (error) => {
          reject(projectName + ':: failed to fetch from gitlab: ' + error.message);
        }
      );
  });
  return promise;
};

const fetchFromGithub = (project, milestone, githubToken, success) => {
  const projectName = project.name;
  const milestoneId = project.milestones[milestone];
  if (!milestoneId) {
    throw ('No milestone found in env configuration for project: ' + projectName);
  }
  const promise = new Promise((resolve, reject) => {
    fetch(`https://api.github.com/repos/${projectName}/issues?milestone=${milestoneId}&state=open`,
      {headers: {
        'Content-Type': 'application/json',
        Authorization: `token ${githubToken}`
      }}).then(
        (response) => {
          if (response.status >= 200 && response.status < 300) {
            response.text().then((data) => {
              try {
                success(data, projectName, milestoneId);
                resolve();
              } catch (err) {
                console.log(err.stack);
                reject(err.toString());
              }
            });
            return;
          }
          reject(project.name + ':: ' + response.status.toString() + ': ' + response.statusText);
        },
        (error) => {
          reject(project.name + ':: failed to fetch from github: ' + error.message);
        }
      );
  });
  return promise;
};

export {mkFromGitlabIssue, mkFromGithubIssue, mkFromGithubMilestone, mkFromGitlabMilestone, fetchFromGitlab, fetchFromGithub};
